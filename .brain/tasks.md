{
    "rules": {
        "context_initialization": {
            "description": "Starting point for each interaction",
            "steps": [
                "ALWAYS read `.brain/project-overview.md` and `.brain/tasks.md`",
                "ALWAYS read `.brain/directory-structure.md`",
            ]
        },
        "safety_requirements": [
            "NEVER break type safety",
            "ALWAYS maintain proper error handling",
            "ALWAYS document new code"
        ],
        "priorities": [
            {
                "source": ".notes/",
                "weight": 1.0
            }
        ],
        "modes": {
            "base": {
                "description": "For routine tasks"
            },
            "enhanced": {
                "description": "For complex problems,
            }
        },
        "project_directives": {
            "name": "cursor-websocket",
            "ai_first": true
        }
    }
}