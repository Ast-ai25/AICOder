'use client';

import {Sidebar, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarSeparator, SidebarFooter, SidebarInput} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useState, useEffect, useCallback} from 'react';
import {interactWithAiAssistant} from '@/ai/flows/responsive-chat-box';
import {autoDetectErrorsAndProvideSolutions} from '@/ai/flows/auto-detect-error-and-solving';
import {toast} from "@/hooks/use-toast"
import { Label } from '@/components/ui/label';
import type * as vscodeType from 'vscode';

// Declare vscode in the global scope
declare global {
  interface Window {
    vscode: vscodeType | undefined;
  }
  var vscode: vscodeType | undefined;
}

interface ErrorAssistantProps {
  code: string;
  filePath: string;
  googleApiKey: string;
  openAiApiKey: string;
  groqApiKey: string;
  deepSeekApiKey: string;
  onCodeChange: (newCode: string) => void;
}

const ErrorAssistant: React.FC<ErrorAssistantProps> = ({ code, filePath, googleApiKey, openAiApiKey, groqApiKey, deepSeekApiKey, onCodeChange }) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [suggestedSolution, setSuggestedSolution] = useState<string | undefined>('');
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCode = useCallback(async (codeToAnalyze: string) => {
    setIsAnalyzing(true);
    try {
      const result = await autoDetectErrorsAndProvideSolutions({
        code: codeToAnalyze,
        filePath: filePath,
        userConsent: true,
      });
      setHasErrors(result.hasErrors);
      setErrorMessage(result.errorMessage);
      setSuggestedSolution(result.suggestedSolution);
      if (result.hasErrors) {
        toast({
          title: "Error Detected",
          description: result.errorMessage || "An error was detected in the code.",
        });
      } else {
         toast({
          title: "No Errors",
          description: "No errors were detected in the code.",
        });
      }
    } catch (error: any) {
      console.error("Error during code analysis:", error);
      setHasErrors(true);
      setErrorMessage(`Code analysis failed: ${error.message}`);
      setSuggestedSolution(undefined);
        toast({
          title: "Analysis Failed",
          description: `Code analysis failed: ${error.message}`,
        });
    } finally {
      setIsAnalyzing(false);
    }
  }, [filePath]);

  const handleAnalyzeCode = () => {
    analyzeCode(code);
  };

  const handleApplyFix = () => {
    if (suggestedSolution) {
      onCodeChange(suggestedSolution); // Apply the fix to the code
      toast({
        title: "Fix Applied",
        description: "The suggested fix has been applied to the code.",
      });
    }
  };

    // Simulate file save event
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        console.log('Simulating file save...');
        analyzeCode(code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, filePath, analyzeCode]);

  useEffect(() => {
    const debouncedAnalyze = setTimeout(() => {
      if (code) {
        analyzeCode(code);
      }
    }, 5000); // Debounce analysis for 5 seconds

    return () => clearTimeout(debouncedAnalyze);
  }, [code, filePath, analyzeCode]);

  return (
    <div>
      <Button onClick={handleAnalyzeCode} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
      </Button>
      {hasErrors && errorMessage && (
        <div>
          <h3>Error:</h3>
          <p>{errorMessage}</p>
          {suggestedSolution && (
            <div>
              <h3>Suggested Solution:</h3>
              <p>{suggestedSolution}</p>
              <Button onClick={handleApplyFix}>Apply Fix</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [code, setCode] = useState('');
  const [filePath, setFilePath] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [deepSeekApiKey, setDeepSeekApiKey] = useState('');
  const [projectPath, setProjectPath] = useState('/src'); // Simulate project path

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

   useEffect(() => {
    // Function to read API keys from VS Code configuration
    const readApiKeys = () => {
      if (typeof window !== 'undefined' && typeof window.vscode !== 'undefined') {
        setGoogleApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('googleApiKey') as string || '');
        setOpenAiApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('openaiApiKey') as string || '');
        setGroqApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('groqApiKey') as string || '');
        setDeepSeekApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('deepSeekApiKey') as string || '');
      }
    };

    // Initial read of API keys
    readApiKeys();

    // Listen for configuration changes
    if (typeof window !== 'undefined' && typeof window.vscode !== 'undefined') {
      const configChangeListener = window.vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('firebase-studio')) {
          readApiKeys();
        }
      });

      return () => {
        configChangeListener.dispose();
      };
    }
  }, []);

  // Use a type assertion to tell TypeScript that 'vscode' might be available
  const vscode = typeof window !== 'undefined' && typeof window.require === 'function' ? (window.vscode ? window.vscode : undefined) : undefined;


  useEffect(() => {
    // Function to get the current active file's code
    const getActiveFileCode = () => {
      if (typeof vscode !== 'undefined' && vscode) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const document = editor.document;
          setCode(document.getText());
          setFilePath(document.uri.fsPath);
        }
      }
    };

    // Initial load of the active file's code
    getActiveFileCode();

    // Listen for active text editor changes
   if (typeof vscode !== 'undefined') {
      const activeTextEditorListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        getActiveFileCode();
      });

      // Listen for document changes
      const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
        getActiveFileCode();
      });

      return () => {
        activeTextEditorListener.dispose();
        documentChangeListener.dispose();
      };
    }
  }, [vscode]);

  const handleSendMessage = async () => {
    const result = await interactWithAiAssistant({message: message});
    setResponse(result.response);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <CardTitle>CodePilot</CardTitle>
          <SidebarInput placeholder="Search..."></SidebarInput>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="ghost">Project Analyzer</Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="ghost">AI Code Generator</Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button variant="ghost">AI Error Solver</Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator></SidebarSeparator>
          <p>Footer</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
           <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="googleApiKey">Google AI API Key</Label>
              <Input
                id="googleApiKey"
                type="password"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
              <Input
                id="openaiApiKey"
                type="password"
                value={openAiApiKey}
                onChange={(e) => setOpenAiApiKey(e.target.value)}
              />
            </div>
               <div>
              <Label htmlFor="groqApiKey">Groq API Key</Label>
              <Input
                id="groqApiKey"
                type="password"
                value={groqApiKey}
                onChange={(e) => setGroqApiKey(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="deepSeekApiKey">DeepSeek API Key</Label>
              <Input
                id="deepSeekApiKey"
                type="password"
                value={deepSeekApiKey}
                onChange={(e) => setDeepSeekApiKey(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={handleSendMessage}>Send</Button>
            <div>{response}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <ErrorAssistant
              code={code}
              filePath={filePath}
              googleApiKey={googleApiKey}
              openAiApiKey={openAiApiKey}
              groqApiKey={groqApiKey}
              deepSeekApiKey={deepSeekApiKey}
              onCodeChange={handleCodeChange}
            />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}


