## Major Project Reflection

# What advice would you give to yourself if you were to start a project like this again?
- Write clean code from the beginning, so it isn't tricky to add new features later on & and so you don't have to clean up code later on
- Don't try to perfect something right away, come up with a super rough version first that does the job and move on. This would've helped me because I dwelled on how the water looked for a while, and I ended up changing it anyway, so instead I could've been working on adding a different feature

# Did you complete everything in your “needs to have” list?
- I did complete everything on my needs to have list, and my final product is a complete game with physics (though it lacks more levels, but that would be relatively simple to add with my JSON system)

# What was the hardest part of the project?
- Figuring out matterJS was a little challenging, it deviated a lot from the usual p5.js way of scripting. I spent of good amount of time figuring out how to check for collisions, and how MatterJS handled bodies. I did have to rewrite a fair amount of code to replace p5js shapes with MatterJS bodies.

# Were there any problems you could not solve?
- Not necessarily, I did fix most if not all the problems that I faced. However, there was one issue where the JSON file would load based on the screen it was created on. I changed this by making cell size variable. There would've been a slightly better way of solving this by redrawing the grid with the JSON file in the middle, so you could have any screensize with a full grid; though this idea was ditched almost immedietly because it was not worth the amount of work for a minor issue.