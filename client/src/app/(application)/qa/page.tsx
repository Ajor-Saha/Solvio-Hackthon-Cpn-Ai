"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Heart, Send, Tag, TrendingUp, Calendar, Search } from "lucide-react";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
}

const initialQuestions: Question[] = [
  {
    id: "q1",
    title: "How do I prepare for a hackathon as a beginner?",
    body: "Looking for a 2-week preparation plan and tech stack suggestions for a university hackathon.",
    tags: ["hackathon", "beginner", "planning"],
    author: "Anika S",
    likes: 18,
    comments: [
      { id: "c1", author: "Rahim", content: "Build a small full‑stack app with auth and a dashboard.", createdAt: new Date().toISOString() },
      { id: "c2", author: "Maya", content: "Practice team roles and a 3‑minute pitch.", createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "q2",
    title: "What counts as a strong project for a software internship?",
    body: "Recruiters keep asking for 'impact'. What should I add to my campus project to make it stand out?",
    tags: ["internship", "projects", "resume"],
    author: "Tanvir",
    likes: 25,
    comments: [],
    createdAt: new Date().toISOString()
  }
];

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string>("");

  const filtered = questions.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.body.toLowerCase().includes(search.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const addQuestion = () => {
    if (!title.trim()) return;
    const newQ: Question = {
      id: crypto.randomUUID(),
      title: title.trim(),
      body: body.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 5),
      author: "You",
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    setQuestions([newQ, ...questions]);
    setTitle(""); setBody(""); setTags("");
  };

  const likeQuestion = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, likes: q.likes + 1 } : q));
  };

  const addComment = (id: string, content: string) => {
    if (!content.trim()) return;
    setQuestions(prev => prev.map(q => q.id === id ? {
      ...q,
      comments: [...q.comments, { id: crypto.randomUUID(), author: "You", content: content.trim(), createdAt: new Date().toISOString() }]
    } : q));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Q&A</h1>
          <p className="text-muted-foreground mt-1">Ask questions, get answers, share knowledge across the campus.</p>
        </div>

        {/* Top actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions, tags, keywords..." className="bg-background" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Hot this week</span>
              <Badge variant="secondary">#{Math.max(questions.length, 12)}</Badge>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ask box */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Ask a question</h2>
            <div className="space-y-3">
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Write a clear, concise title" />
              <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Describe what you tried, expected, and observed" rows={5} />
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated, e.g., react, internship)" />
              </div>
              <div className="flex justify-end">
                <Button onClick={addQuestion}>
                  <Send className="w-4 h-4 mr-2" /> Post Question
                </Button>
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Guidelines</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                <li>Be specific and show what you tried.</li>
                <li>Use tags so others can find your question.</li>
                <li>Be respectful and helpful.</li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["react", "internship", "hackathon", "backend", "ml", "scholarship"].map(t => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Questions list */}
        <div className="mt-10 space-y-6">
          {filtered.map(q => (
            <Card key={q.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/asset/avatarPic.jpg" />
                  <AvatarFallback>{q.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold leading-tight">{q.title}</h3>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{q.body}</p>

                  <div className="flex items-center gap-2 mt-3">
                    {q.tags.map(t => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <Button size="sm" variant="outline" onClick={() => likeQuestion(q.id)}>
                      <Heart className="w-4 h-4 mr-1" /> {q.likes}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" /> {q.comments.length}
                    </Button>
                  </div>

                  {/* Comments */}
                  {q.comments.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <Separator />
                      {q.comments.map(c => (
                        <div key={c.id} className="flex items-start gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src="/asset/avatarPic.jpg" />
                            <AvatarFallback>{c.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{c.author}</div>
                            <div className="text-sm text-muted-foreground">{c.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="mt-4 flex items-center gap-2">
                    <Input placeholder="Write a comment..." onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addComment(q.id, (e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = "";
                      }
                    }} />
                    <Button size="sm" onClick={() => {
                      const el = document.querySelector<HTMLInputElement>(`#comment-${q.id}`)
                      if (el && el.value) { addComment(q.id, el.value); el.value = ""; }
                    }}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
