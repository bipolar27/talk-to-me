import { ResponsiveDialog } from "@/components/responsive-dialog";
import { title } from "process";
import { AgentForm } from "./agent-form";
import { AgentGetOne } from "../../types";

interface UpdateAgentDialogProps{
    open:boolean,
    onOpenChange : (open:boolean)=>void,
    initalValues:AgentGetOne;

};

export const UpdateAgentDialog = ({
    open,
    onOpenChange,
    initalValues
}:UpdateAgentDialogProps)=>{
    return (
        <ResponsiveDialog
            title = "Edit Agent"
            description = "Edit the agent"
            open = {open}
            onOpenChange = {onOpenChange}
        >
            <AgentForm
                onSuccess={()=>onOpenChange(false)}
                onCancel={()=>onOpenChange(false)}
                initalValues={initalValues}
            />
        </ResponsiveDialog>
    )
}