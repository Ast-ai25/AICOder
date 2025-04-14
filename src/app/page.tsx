'use client';

import {Sidebar, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarSeparator, SidebarFooter, SidebarInput} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useState} from 'react';
import {interactWithAiAssistant} from '@/ai/flows/responsive-chat-box';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

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
      </SidebarInset>
    </SidebarProvider>
  );
}
