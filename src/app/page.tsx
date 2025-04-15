'use client';

import {Sidebar, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarSeparator, SidebarFooter, SidebarInput} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useState, useEffect, useCallback} from 'react';
import { Label } from '@/components/ui/label';
import type * as vscodeType from 'vscode';

const Home = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [code, setCode] = useState('');
  const [filePath, setFilePath] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [deepSeekApiKey, setDeepSeekApiKey] = useState('');
  const [vscode, setVscode] = useState<vscodeType | undefined>(undefined);


  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.vscode !== 'undefined') {
      setVscode(window.vscode);
      const readApiKeys = () => {
        setGoogleApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('googleApiKey') as string || '');
        setOpenAiApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('openaiApiKey') as string || '');
         setGroqApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('groqApiKey') as string || '');
        setDeepSeekApiKey(window.vscode.workspace.getConfiguration('firebase-studio').get('deepSeekApiKey') as string || '');
      };
      readApiKeys();

       const configChangeListener = window.vscode.workspace.onDidChangeConfiguration(() => {
          readApiKeys();
        });
        return () => {
          configChangeListener.dispose();
        };
    }
  }, []);


  useEffect(() => {
    const getActiveFileCode = () => {
      if (vscode && vscode.window.activeTextEditor) {
        const editor = vscode.window.activeTextEditor;
        setCode(editor.document.getText());
        setFilePath(editor.document.uri.fsPath);
      }
    };

    getActiveFileCode();
   if (vscode) {
      const activeTextEditorListener = vscode.window.onDidChangeActiveTextEditor(() => {
        getActiveFileCode();
      });

       const documentChangeListener = vscode.workspace.onDidChangeTextDocument(() => {
         getActiveFileCode();
       });

      return () => {
        activeTextEditorListener.dispose();
         documentChangeListener.dispose();
      };
    }
  }, [vscode]);

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
            <Button>Send</Button>
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Home;
