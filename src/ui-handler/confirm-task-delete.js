import GObject from "gi://GObject";
import Adw from "gi://Adw";
import { RESPONSES } from "../static.js";

export const ConfirmTaskDeleteDialog = GObject.registerClass({
    GTypeName: "ConfirmTaskDeleteDialog",
    Template: "resource:///io/github/andrepg/Doit/ui/confirm-task-delete.ui"
}, class ConfirmTaskDeleteDialog extends Adw.AlertDialog {
    _init(params) {
        super._init(params);

        this.add_response(RESPONSES.cancel.action, RESPONSES.cancel.label);
        this.add_response(RESPONSES.confirm.action, RESPONSES.confirm.label);

        this.set_close_response(RESPONSES.cancel.action);
        this.set_default_response(RESPONSES.cancel.action);

        this.set_response_appearance(
            RESPONSES.confirm.action,
            Adw.ResponseAppearance.DESTRUCTIVE
        );
    }
});
