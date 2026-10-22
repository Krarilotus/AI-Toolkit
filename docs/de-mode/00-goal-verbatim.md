# DE mode: original goal instructions

These excerpts preserve the user's wording from 22 October 2026. The working
contract and plan may explain them, but must not silently replace their meaning.
The source conversation is T3 thread `e6cb74dd-1848-498d-be26-75fddd1f038a`.

## Sources and shared research

> I let chatgpt summarize my current information for DE format:
> https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/develop/Findings/AIToolkitDE.md

> https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/tree/main/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge

> Honestly we might need to add a pull to the UCP Repo for all the related Modding Projects to DE just to be fully sure we have everything in the UCP Project.

> -> for reference a folder of the DE is here:
> D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition

> You can go ham all you want on the decompiling, analyzing etc. But use sufficient subagents for the job.

## Product goal

> Anyways: What i wanted to ask you, is to make a proper plan on getting  completely separated 'DE' mode set up, that would then enable the DE added features in the interface, by switching a toggle. However if you do so, it would also ask you for your DE location. You may use the Computer to just set everything up on my AI Toolkit, we already have like Units in the Editor but they have just generated Artworks instead of the real stuff

> So what i think we need for DE mode is:
> - a compatible export, we can look at Sushis editor. Especially for the lordson and we need to be sure we can also import pictures voices and so on into the game, kinda similar to the UCP: For  that you would need to figure out what the difference in the ghidra codebases is, as one is 64 bit and slightly newer (the DE version) and our original and more understood version is HD 1.41 and 32 bit. Most of the core is probably very similarly structured, but it would be good if we can also if the user for example has no HD version selected, on first startup just let him choose their game folder as per usual. Detect if he chose a DE edition and switch to the DE mode autoamtically if so, and then load assets and view and so on from the DE instead. I don't know how difficult the transition would be, i assume its pretty similar as most of the code is shared, but you might encounter some differences.
> Also keep books on the differences in an ordered format.

> Also write these initial instructions down verbatim (Just the parts of what defines the goal for the long running tasks, and also make sure to ask me at the beginning if anything is unclear!) to reference, and go by them if any undecided stuff occurs, and ofc pass the link also to your subagents, the set up needs to be gardened well, so that the whole process can run continuously until the full DE mode is complete which means the DE is fully support, as well as the normal SHC and there is a way to actually load the AI into the Game, maybe even through the editor directly if no such mod for completion exists just yet

> (And make sure to open another branch on my repo for these changes so that we can commit and no CI runs please for this, commit regularly, when a good milestone is hit and we make sure that we don'T poison the original editor with it accidentally if something breaks. That way we can go ham!)

## Confirmed follow-up instructions

The user answered the opening clarification questions:

> Allow a community loader when needed

> Yes, use an isolated test setup

The user also wrote:

> you can even launch on the PC itself if you really need! (while i am not using it)

> please also set up the goal so that you can work on it until its really completed

> Create a linked UCP continuation

> it needs to be in the sidebar

> just make sure you always ever use Sol 6.1 subagents for any subagents you use and give them clear isntructions, and focus yourself on the planning and orchestration

## Architecture and code-health steering

> make sure the code is properly modularized and not jsut hardcoded on top of the existing one, i want to be able to later distinguish what is for DE what is for non DE and make sure we follow single source of truth standards, no split brain methodology where thigns need to be recoded up agaian and again, just make sure the overall software stack is sound and proper, and take your time to rethink and refactor to make sure the existing code scales and grows responsibly. Better do a little tooling up front than clean up a bunch of mess later

> (and don't get those directions lost!)
