"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, X, Edit2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChartPreview } from "@/components/chart-preview"
import { cn } from "@/lib/utils"

type Widget = {
  id: string
  name: string
  type: "bar" | "pie" | "line"
  data: any
}

type WidgetPanelProps = {
  widgets: Widget[]
  isOpen: boolean
  onToggle: () => void
  onRemove: (id: string) => void
  onRename: (id: string, newName: string) => void
}

export function WidgetPanel({ widgets, isOpen, onToggle, onRemove, onRename }: WidgetPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null)

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName)
    }
    setEditingId(null)
  }

  const toggleExpand = (id: string) => {
    setExpandedWidget(expandedWidget === id ? null : id)
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t transition-all duration-300 z-10",
        isOpen ? "h-64" : "h-10",
      )}
    >
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-medium flex items-center gap-2">Saved Widgets ({widgets.length})</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="p-4 overflow-auto h-[calc(100%-40px)] flex gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={cn(
                "border rounded-lg flex-shrink-0 transition-all",
                expandedWidget === widget.id ? "w-full h-full fixed top-0 left-0 z-50 bg-background p-4" : "w-64",
              )}
            >
              <div className="p-2 border-b flex items-center justify-between">
                {editingId === widget.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleSaveEdit(widget.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h4 className="font-medium text-sm truncate flex-1">{widget.name}</h4>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(widget.id)}>
                    {expandedWidget === widget.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  {editingId !== widget.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleStartEdit(widget.id, widget.name)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onRemove(widget.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <ChartPreview data={widget.data} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

