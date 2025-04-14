'use client';

import {Sidebar, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarSeparator, SidebarFooter, SidebarInput} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useState, useEffect} from 'react';
import {interactWithAiAssistant} from '@/ai/flows/responsive-chat-box';
import {autoDetectErrorsAndProvideSolutions} from '@/ai/flows/auto-detect-error-and-solving';

interface ErrorAssistantProps {
  code: string;
  filePath: string;
}

const ErrorAssistant: React.FC<ErrorAssistantProps> = ({ code, filePath }) => {
  const [errorMessage, setErrorMessage] = useState<string | undefined>('');
  const [suggestedSolution, setSuggestedSolution] = useState<string | undefined>('');
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const handleAnalyzeCode = async () => {
    try {
      const result = await autoDetectErrorsAndProvideSolutions({
        code: code,
        filePath: filePath,
        userConsent: true,
      });
      setHasErrors(result.hasErrors);
      setErrorMessage(result.errorMessage);
      setSuggestedSolution(result.suggestedSolution);
    } catch (error: any) {
      console.error("Error during code analysis:", error);
      setHasErrors(true);
      setErrorMessage(`Code analysis failed: ${error.message}`);
      setSuggestedSolution(undefined);
    }
  };

  return (
    <div>
      <Button onClick={handleAnalyzeCode}>Analyze Code</Button>
      {hasErrors && errorMessage && (
        <div>
          <h3>Error:</h3>
          <p>{errorMessage}</p>
          {suggestedSolution && (
            <div>
              <h3>Suggested Solution:</h3>
              <p>{suggestedSolution}</p>
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
            <ErrorAssistant code={code} filePath={filePath} />
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
