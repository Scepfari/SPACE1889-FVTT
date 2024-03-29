export default class SPACE1889Hotbar extends Hotbar
{
    async collapse() {
        if (this._collapsed) return true

        $(this.element).addClass("collapsedHotbar")
        return super.collapse()
    }

    async expand() {
        if (!this._collapsed) return true

        $(this.element).removeClass("collapsedHotbar")
        return super.expand()
    }
}
