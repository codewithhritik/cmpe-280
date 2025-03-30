"use client";

import { ChartPreview } from "@/components/chart-preview";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type WidgetDialogProps = {
    widget: {
        id: string;
        name: string;
        type: "bar" | "pie" | "line";
        data: any;
    } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function WidgetDialog({
    widget,
    open,
    onOpenChange,
}: WidgetDialogProps) {
    if (!widget) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[90vw]">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">
                        {widget.name}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 absolute right-4 top-4"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>
                <div className="mt-6 bg-card p-4 rounded-lg border">
                    <ChartPreview data={widget.data} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
