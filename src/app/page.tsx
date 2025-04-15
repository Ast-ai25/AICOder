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

interface ErrorAssistantProps {
  code: string;
  filePath: string;
  onCodeChange: (newCode: string) => void;
}

const ErrorAssistant: React.FC<ErrorAssistantProps> = ({ code, filePath, onCodeChange }) => {
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

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [code, setCode] = useState('');
  const [filePath, setFilePath] = useState('');

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };


  useEffect(() => {
    // Example code and file path for demonstration
    setCode(`
    function greet(name) {
      if (name == "John")
        return "Hello, " + name;
      }
    }
    `);
    setFilePath('/src/example.js');

    // Simulate file save event (for demonstration purposes)
    const simulateFileSave = () => {
      console.log('Simulating file save...');
      // In a real-world scenario, this would be triggered by a file system event
      // or IDE integration
    };

    // Simulate background error analysis (for demonstration purposes)
    const backgroundAnalysisInterval = setInterval(() => {
      console.log('Running background error analysis...');
      // In a real-world scenario, this would trigger the analyzeCode function
    }, 60000); // Run every 60 seconds

    return () => {
      clearInterval(backgroundAnalysisInterval);
    };
  }, []);

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
            <ErrorAssistant code={code} filePath={filePath} onCodeChange={handleCodeChange} />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
