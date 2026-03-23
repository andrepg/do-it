import GObject20 from "gi://GObject";
import Gtk40 from "gi://Gtk";

const useAutocomplete = () => {
    /**
     * Creates a new Gtk.EntryCompletion instance.
     */
    const completion = new Gtk40.EntryCompletion();

    /**
     * Creates a new Gtk.ListStore instance.
     */
    const listModel = new Gtk40.ListStore();

    listModel.set_column_types([GObject20.TYPE_STRING]);

    /**
     * Sets the list model for the completion.
     */
    completion.set_model(listModel);
    completion.set_text_column(0);
    completion.set_inline_completion(true);
    completion.set_popup_single_match(false);

    const append = (item: string) => {
        listModel.set(listModel.append(), [0], [item])
    }

    const append_many = (items: string[]) => {
        items.forEach((item) => {
            append(item);
        })
    }

    /**
     * Clear list model
     */
    const clear = () => {
        listModel.clear();
    }

    return {
        autocomplete: completion,
        append_item: append,
        clear_list: clear,
    };
}

export default useAutocomplete;