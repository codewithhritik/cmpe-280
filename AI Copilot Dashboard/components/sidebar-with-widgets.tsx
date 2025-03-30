"use client";

import { useState } from "react";
import {
    Home,
    Settings,
    HelpCircle,
    BarChart4,
    X,
    Edit2,
    Check,
    ChevronDown,
    ChevronRight,
    LineChart,
    PieChart,
    BarChart,
    Loader2,
    InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartPreview } from "@/components/chart-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Widget } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

type SidebarWithWidgetsProps = {
    widgets: Widget[];
    onRemove: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    isLoading: boolean;
};

export function SidebarWithWidgets({
    widgets,
    onRemove,
    onRename,
    isLoading,
}: SidebarWithWidgetsProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
    const [isWidgetsOpen, setIsWidgetsOpen] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleStartEdit = (id: string, currentName: string) => {
        setEditingId(id);
        setEditName(currentName);
    };

    const handleSaveEdit = async (id: string) => {
        if (editName.trim()) {
            try {
                await onRename(id, editName);
                toast({
                    title: "Chart renamed",
                    description: "The chart has been renamed successfully",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to rename chart. Please try again.",
                    variant: "destructive",
                });
            }
        }
        setEditingId(null);
    };

    const openWidgetDialog = (widget: Widget) => {
        setSelectedWidget(widget);
        setIsDialogOpen(true);
    };

    const confirmDelete = (id: string) => {
        setWidgetToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (widgetToDelete) {
            try {
                await onRemove(widgetToDelete);
                toast({
                    title: "Chart deleted",
                    description: "The chart has been deleted successfully",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete chart. Please try again.",
                    variant: "destructive",
                });
            }
            setIsDeleteDialogOpen(false);
            setWidgetToDelete(null);
        }
    };

    const getChartIcon = (type: string) => {
        switch (type) {
            case "pie":
                return <PieChart className="h-4 w-4 text-primary" />;
            case "line":
                return <LineChart className="h-4 w-4 text-primary" />;
            case "bar":
            default:
                return <BarChart className="h-4 w-4 text-primary" />;
        }
    };

    return (
        <TooltipProvider>
            <div className="w-80 border-r bg-card flex flex-col h-screen">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                        <BarChart4 className="h-6 w-6 text-primary mr-2" />
                        <h1 className="font-semibold text-lg">AI Copilot</h1>
                    </div>
                    <ThemeToggle />
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <nav className="p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start mb-1 bg-muted/50"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start mb-1"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Help
                        </Button>
                    </nav>

                    <div className="px-2 py-1">
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="p-3 text-xs">
                                <div className="flex items-start gap-2">
                                    <InfoIcon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            Database Setup
                                        </p>
                                        <p className="mt-1 text-muted-foreground">
                                            Create a{" "}
                                            <code className="bg-muted px-1 rounded">
                                                widgets
                                            </code>{" "}
                                            table in Supabase with columns:
                                            <code className="block bg-muted p-1 mt-1 rounded">
                                                id: uuid
                                                <br />
                                                session_id: text
                                                <br />
                                                name: text
                                                <br />
                                                type: text
                                                <br />
                                                data: jsonb
                                                <br />
                                                created_at: timestamp
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <Collapsible
                            open={isWidgetsOpen}
                            onOpenChange={setIsWidgetsOpen}
                            className="border-t mt-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between p-3 rounded-none"
                                >
                                    <span className="font-medium flex items-center">
                                        <BarChart4 className="h-4 w-4 mr-2" />
                                        Saved Charts
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="ml-2 mr-2"
                                    >
                                        {widgets.length}
                                    </Badge>
                                    {isWidgetsOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <ScrollArea className="h-[calc(100vh-300px)] px-2">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center p-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span className="ml-2">
                                                Loading charts...
                                            </span>
                                        </div>
                                    ) : widgets.length === 0 ? (
                                        <div className="text-sm text-muted-foreground p-4 text-center border rounded-md m-2 bg-muted/20">
                                            <p>No saved charts yet</p>
                                            <p className="text-xs mt-1">
                                                Charts you save will appear here
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 py-2">
                                            {widgets.map((widget) => (
                                                <div
                                                    key={widget.id}
                                                    className="border rounded-md overflow-hidden transition-all w-full hover:shadow-md"
                                                >
                                                    <div className="p-2 flex flex-col gap-2 bg-muted/30">
                                                        <div className="flex items-center justify-between">
                                                            {editingId ===
                                                            widget.id ? (
                                                                <div className="flex items-center gap-1 flex-1">
                                                                    <Input
                                                                        value={
                                                                            editName
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setEditName(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="h-7 text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() =>
                                                                            handleSaveEdit(
                                                                                widget.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Check className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center flex-1">
                                                                    {getChartIcon(
                                                                        widget.type
                                                                    )}
                                                                    <h4 className="font-medium text-sm truncate ml-2">
                                                                        {
                                                                            widget.name
                                                                        }
                                                                    </h4>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1">
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-8 text-xs flex-1 mr-2"
                                                                onClick={() =>
                                                                    openWidgetDialog(
                                                                        widget
                                                                    )
                                                                }
                                                            >
                                                                View Chart
                                                            </Button>

                                                            <div className="flex items-center gap-1">
                                                                {editingId !==
                                                                    widget.id && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() =>
                                                                            handleStartEdit(
                                                                                widget.id,
                                                                                widget.name
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit2 className="h-3 w-3" />
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                                                    onClick={() =>
                                                                        confirmDelete(
                                                                            widget.id
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>

                <div className="p-2 border-t">
                    <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Widget Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            {selectedWidget &&
                                getChartIcon(selectedWidget.type)}
                            <span className="ml-2">{selectedWidget?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedWidget && (
                            <ChartPreview data={selectedWidget.data} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the chart.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    );
}
