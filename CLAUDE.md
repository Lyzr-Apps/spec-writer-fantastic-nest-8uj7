# Next.js React Frontend

## DO NOT EXPLORE — START BUILDING IMMEDIATELY

For FRESH BUILDS: Do NOT list directories or browse the file structure. Read ONLY `response_schemas/*.json` and `workflow.json` — then immediately start writing `app/page.tsx`. No exploring, no reading other files.

For ITERATIONS: Read `app/page.tsx` first to understand current state, then `response_schemas/*.json` for any updated response shapes.

---

## Import Rules

**Icons:** `lucide-react` ONLY (never react-icons)
```tsx
import { Loader2, Send, X } from 'lucide-react'
```

**Components:** `@/components/ui/*` (shadcn only)
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

**Agent Calls:** `@/lib/aiAgent` (client-side, calls pre-built `/api/agent` route — NEVER create new routes)
```tsx
import { callAIAgent } from '@/lib/aiAgent'
// callAIAgent(message, agent_id) — ONLY way to call agents. NEVER custom fetch.
```

---

## COMPONENT WHITELIST (CLOSED SET — nothing else exists)

**ONLY these components may be used in `app/page.tsx`.** If a name is not listed here, it does NOT exist. Define custom components inline as functions in page.tsx.

### shadcn/ui Components (import from `@/components/ui/<file>`)

| File | Exports |
|------|---------|
| accordion | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| alert | `Alert`, `AlertTitle`, `AlertDescription` |
| alert-dialog | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` |
| aspect-ratio | `AspectRatio` |
| avatar | `Avatar`, `AvatarImage`, `AvatarFallback` |
| badge | `Badge` |
| breadcrumb | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| button | `Button` |
| calendar | `Calendar` |
| card | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` |
| carousel | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` |
| chart | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` |
| checkbox | `Checkbox` |
| collapsible | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` |
| command | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` |
| context-menu | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuLabel`, `ContextMenuSeparator` |
| dialog | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| drawer | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose` |
| dropdown-menu | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup` |
| empty | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyMedia` |
| form | `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField` |
| hover-card | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` |
| input | `Input` |
| input-group | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupText` |
| input-otp | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` |
| label | `Label` |
| menubar | `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator` |
| navigation-menu | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink` |
| pagination | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` |
| popover | `Popover`, `PopoverTrigger`, `PopoverContent` |
| progress | `Progress` |
| radio-group | `RadioGroup`, `RadioGroupItem` |
| resizable | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` |
| scroll-area | `ScrollArea`, `ScrollBar` |
| select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`, `SelectGroup`, `SelectLabel` |
| separator | `Separator` |
| sheet | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` |
| sidebar | `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarMenu`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarProvider`, `SidebarTrigger` |
| skeleton | `Skeleton` |
| slider | `Slider` |
| sonner | `Toaster` |
| spinner | `Spinner` |
| switch | `Switch` |
| table | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` |
| tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| textarea | `Textarea` |
| toggle | `Toggle` |
| toggle-group | `ToggleGroup`, `ToggleGroupItem` |
| tooltip | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` |

### lucide-react Icons (commonly used)

```
Search, Send, X, Plus, Minus, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Loader2, Menu, Settings, User, Users,
Home, Mail, Phone, Calendar, Clock, Star, Heart, Trash2, Edit, Copy, Download,
Upload, File, FileText, Image, Camera, Mic, MicOff, Volume2, VolumeX, Play, Pause,
Square, Circle, AlertCircle, AlertTriangle, Info, HelpCircle, ExternalLink, Link,
Eye, EyeOff, Lock, Unlock, Shield, Zap, RefreshCw, RotateCcw, Filter, SortAsc,
MapPin, Globe, Bookmark, Tag, Hash, AtSign, MessageSquare, MessageCircle, Bot,
Sparkles, Wand2, Palette, Layout, Grid, List, BarChart3, PieChart, TrendingUp
```

Any lucide-react icon name is valid — check https://lucide.dev/icons for the full set. The list above is for convenience.

### HALLUCINATION BLACKLIST (these DO NOT exist — never use them)

| Hallucinated Name | Use Instead |
|---|---|
| `SectionCard` | `Card` + `CardHeader` + `CardContent` |
| `DiscoverScreen` | Plain `<div>` or `Card` |
| `FeatureCard` | `Card` + `CardContent` — or define inline: `function FeatureCard(...)` |
| `ActionButton` | `Button` |
| `IconButton` | `Button` with `variant="ghost" size="icon"` |
| `TextInput` | `Input` |
| `SearchInput` | `Input` with a Search icon |
| `NavBar` / `Navbar` | `<nav>` with Tailwind — or define inline |
| `Container` | `<div className="max-w-7xl mx-auto px-4">` |
| `Hero` / `HeroSection` | Plain `<section>` with Tailwind |
| `Footer` | `<footer>` with Tailwind |
| `Modal` | `Dialog` |
| `Dropdown` | `DropdownMenu` or `Select` |
| `Toast` | `Toaster` from sonner |
| `Chip` | `Badge` |
| `Tag` | `Badge` |
| `Spinner` (from wrong path) | `Spinner` from `@/components/ui/spinner` or `Loader2` with `animate-spin` |
| `Box` / `Stack` / `Flex` | Plain `<div>` with Tailwind flex/grid classes |

**Rule:** If you need a component that isn't in the whitelist above, **define it as a function** in `page.tsx`:

```tsx
// CORRECT — define custom components inline
function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent><p>{desc}</p></CardContent>
    </Card>
  )
}
```

---

## callAIAgent Response (GUARANTEED)

```tsx
const result = await callAIAgent(message, AGENT_ID)

// Structure is ALWAYS:
result.success          // boolean - API call succeeded?
result.response.status  // "success" | "error" - agent status
result.response.result  // { ...agent data } - YOUR FIELDS HERE (preserves agent schema exactly)
result.response.message // string | undefined - display text extracted from result
result.module_outputs   // { artifact_files?: [{ file_url, name, format_type }] } - images/files from agent
```

### Response Field Preservation

`result` preserves the agent's schema fields exactly as returned. If the agent's `response_format` schema defines `{"result": {"response": "text"}}`, then `result.response.result.response` will contain the text. Common field names inside `result`: `text`, `response`, `message`, `answer`, `summary`, `content`.

The `message` field is auto-extracted from the first matching text field inside `result` for display convenience (via `extractText()`).

### Complete Usage Example
```tsx
'use client'
import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'

export default function MyPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const result = await callAIAgent(userMessage, AGENT_ID)

    if (result.success && result.response.status === 'success') {
      setData(result.response.result)
    } else {
      setError(result.response.message || 'Request failed')
    }

    setLoading(false)
  }

  // ... rest of component
}
```

---

## CRITICAL: EVERYTHING IS PRE-BUILT — NEVER RECREATE

This template is a complete, wired-up app. NEVER recreate, rewrite, or duplicate any existing file.

### API Routes (NEVER create new `route.ts` files)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/agent` | POST | Call AI agent |
| `/api/upload` | POST | Upload files for AI analysis |
| `/api/rag` | POST/PATCH/DELETE | RAG knowledge base operations |
| `/api/scheduler` | GET/POST/DELETE | Schedule management operations |
| `/api/lyzr-config` | GET | Get API key (utility) |

### Client Libraries (NEVER write custom `fetch()` calls)

| Library | Import | Use for |
|---------|--------|---------|
| `@/lib/aiAgent` | `callAIAgent`, `uploadFiles`, `useAIAgent`, `useFileUpload`, `extractText` | Agent calls, file uploads |
| `@/lib/ragKnowledgeBase` | `getDocuments`, `uploadAndTrainDocument`, `deleteDocuments`, `crawlWebsite`, `validateFile`, `isFileTypeSupported`, `useRAGKnowledgeBase` | RAG/knowledge base operations |
| `@/lib/scheduler` | `listSchedules`, `getSchedule`, `getSchedulesForAgent`, `getScheduleLogs`, `getRecentExecutions`, `createSchedule`, `pauseSchedule`, `resumeSchedule`, `triggerScheduleNow`, `deleteSchedule`, `cronToHuman`, `useScheduler` | Schedule management |
| `@/lib/clipboard` | `copyToClipboard`, `useCopyToClipboard` | Clipboard operations |
| `@/lib/jsonParser` | `parseLLMJson` | JSON parsing |
| `@/lib/utils` | `cn` | Class name merging |

### Tool Parameter Forms (for agents with tools)

**If your agent uses external tools (Gmail, Slack, Calendar, etc.), create input forms to collect required parameters BEFORE calling the agent.**

Example for Gmail send email:
```tsx
const [emailForm, setEmailForm] = useState({ recipient: '', subject: '', body: '' })

<Input 
  placeholder="Recipient" 
  value={emailForm.recipient}
  onChange={(e) => setEmailForm(prev => ({ ...prev, recipient: e.target.value }))}
/>
<Button 
  onClick={() => callAIAgent(`Send email to ${emailForm.recipient}...`, AGENT_ID)}
  disabled={!emailForm.recipient || !emailForm.subject}
>
  Send Email
</Button>
```

See `TOOL_PARAMETER_FORMS_GUIDE.md` for complete patterns and examples.

### Components (NEVER create files in `components/`)

All shadcn/ui components are installed at `@/components/ui/*`. See COMPONENT WHITELIST above. Define custom components inline in `page.tsx`.

### Providers (already in `layout.tsx` — NEVER recreate)

`ErrorBoundary` · `AgentInterceptorProvider` · `IframeLoggerInit` · `KnowledgeBaseUpload`

**If it exists in the template, import it. Do not rebuild it.**

---

## UI Code Location

**CRITICAL:**
- ALL UI code goes in `app/page.tsx`
- Define components inline or import from `@/components/ui/`
- NEVER create files in `components/` (reserved for shadcn/ui)

```tsx
// app/page.tsx

// Define inline components
const ChatMessage = ({ message }: { message: string }) => (
  <div className="p-4 bg-muted rounded-lg">{message}</div>
)

// Main page component
export default function Page() {
  return (
    <div>
      <ChatMessage message="Hello" />
    </div>
  )
}
```

---

## Sections (for parallel builds)

- `app/sections/*.tsx` — max 4 files, page-level sections only
- Each: `'use client'`, one `export default function`, typed props
- Same import rules as page.tsx (shadcn/ui, lucide-react, @/lib/*)
- `components/` still reserved for shadcn/ui — NEVER create files there
- Simple apps (1 agent, no special features): skip sections, use monolithic page.tsx

## Write Tool Fallback

If the Write tool fails for any file (`app/page.tsx` or `app/sections/*.tsx`):
1. Write a minimal version first (imports + one component)
2. Use Edit to append remaining components one at a time
3. Never retry the same failed Write — always switch to incremental Edit

---

## File Upload with AI Analysis

```tsx
'use client'
import { uploadFiles, callAIAgent } from '@/lib/aiAgent'

const handleFileUpload = async (file: File) => {
  // 1. Upload file
  const uploadResult = await uploadFiles(file)

  if (uploadResult.success) {
    // 2. Call agent with asset IDs
    const result = await callAIAgent('Analyze this document', AGENT_ID, {
      assets: uploadResult.asset_ids
    })
  }
}
```

---

## RAG Knowledge Base

```tsx
'use client'
import {
  getDocuments,
  uploadAndTrainDocument,
  deleteDocuments,
  useRAGKnowledgeBase
} from '@/lib/ragKnowledgeBase'

// Using hook
const { documents, loading, fetchDocuments, uploadDocument, removeDocuments } = useRAGKnowledgeBase()

// Or direct functions
const docs = await getDocuments('rag-id')
await uploadAndTrainDocument('rag-id', file)
await deleteDocuments('rag-id', ['doc.pdf'])
```

---

## Environment Variables

**Server-side (in `.env.local`):**
```
LYZR_API_KEY=your-api-key
```

**Client-side access (if needed):**
```tsx
// Only NEXT_PUBLIC_ prefixed vars are exposed to client
const publicVar = process.env.NEXT_PUBLIC_SOME_VAR
```

---

## Fast Development

The project is configured for fast dev with Turbopack:
```bash
npm run dev  # Uses --turbo flag
```

---

## Available shadcn/ui Components (All Prebuilt)

All these components are prebuilt in `@/components/ui/` — import directly, no installation needed:

```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb,
button, button-group, calendar, card, carousel, chart, checkbox, collapsible,
command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
hover-card, input, input-group, input-otp, item, kbd, label, menubar,
navigation-menu, pagination, popover, progress, radio-group, resizable,
scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip
```

---

## IFRAME-BLOCKED APIs (CRITICAL!)

This app runs in an iframe. These browser APIs are BLOCKED and will throw errors:

### Clipboard - USE UTILITY!
```tsx
// BANNED - Will throw NotAllowedError:
navigator.clipboard.writeText(text)  // BLOCKED!

// CORRECT - Use safe utility:
import { copyToClipboard } from '@/lib/clipboard'

const handleCopy = async () => {
  const success = await copyToClipboard(text)
  if (success) setCopied(true)
}
```

### Other Blocked APIs
- `navigator.geolocation` - blocked
- `navigator.share()` - blocked
- `window.open()` - may be blocked

---

## Anti-Hallucination Checklist

Before writing UI code:
- [ ] Read workflow.json for agent_ids?
- [ ] Read response_schemas/*.json for field names?
- [ ] Interfaces match schema exactly?
- [ ] Using optional chaining (?.)?
- [ ] Loading/error states handled?
- [ ] Only lucide-react icons?
- [ ] Only shadcn/ui components?
- [ ] 'use client' directive for client components?
- [ ] No navigator.clipboard? (use @/lib/clipboard)
