export class Space1889Tour extends foundry.nue.Tour
{
	static tours = ["systems/space1889/module/tours/pcActor"]; //, "systems/space1889/module/tours/settings", "systems/space1889/modules/tours/item"]

	static async registerTours()
	{
        for(let tour of this.tours){
			const obj = await this.fromJSON(`${tour}.json`);

			obj.config.title = game.i18n.localize(obj.config.title);
			for (let step of obj.steps)
			{
				if(step.title.substring(0, 10) == "SPACE1889.")
					step.title = game.i18n.localize(step.title)
				step.content = game.i18n.localize(step.content);
			}

            game.tours.register(obj.config.module, obj.id, obj);
        }
    }

	async _preStep()
	{
        if(this.currentStep.activateTab){
            ui.sidebar.activateTab(this.currentStep.activateTab)
        }
        else if(this.currentStep.activateLayer && canvas.activeLayer.options.name != this.currentStep.activateLayer){
            await canvas[this.currentStep.activateLayer].activate()
            await delay(100)
        }
        else if(this.currentStep.appTab){
            this.app.activateTab(this.currentStep.appTab)
        }
    }

	exit()
	{
        super.exit()
    }

	async start()
	{
		if (this.config.preCommand)
		{
            const fn = await eval(`(async() => { ${this.config.preCommand} })`)
            await fn()            
        }
		if (this.app)
		{
            await this.app.render(true, {focus: true})
            while(!this.app.rendered) await delay(50)            
        }
        if(this.app || this.config.preCommand)
            while(!$(this.steps[this.stepIndex + 1].selector + ':visible').length) await delay(50)

        const res = await super.start()
        $('#tooltip').show()
        return res
    }
}

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}