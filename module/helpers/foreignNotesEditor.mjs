export default class ForeignNotesEditor extends FormApplication{
    constructor(actorId, field, name){
        super()
        this.editfield = field
        this.actorId = actorId
        this.fieldname = name
        const actor = game.actors.get(this.actorId)
        this.object = {
            fieldContent: getProperty(actor, this.editfield)
        }
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        foundry.utils.mergeObject(options, {
            resizable: true,
            width: 600,
            height: 600
        });
        return options;
    }

    isEditable(){
        return true
    }

    get title(){
        const actor = game.actors.get(this.actorId)
        return `${actor.name} - ${game.i18n.localize(this.fieldname)}`
    }

    async _updateObject(event, formData) {
        game.socket.emit("system.space1889", {
            type: "updateNotes",
            payload: {
                actorId: this.actorId,
                updateData: formData.fieldContent
            }
        })
    }

    async getData(options){
        const data = super.getData(options)
        foundry.utils.mergeObject(data, {
            fieldContent: this.object.fieldContent
        })
        return data
    }

    get template(){
        return "systems/space1889/templates/dialog/foreignNotesEditor.html"
    }

    activateListeners(html){
        super.activateListeners(html)
    }
}
