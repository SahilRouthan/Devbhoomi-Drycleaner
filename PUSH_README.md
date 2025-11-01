This repository includes a helper script `scripts/push-to-github.ps1` to assist with safely pushing the project to GitHub.

How to use (PowerShell):

1. Open PowerShell in the project root (e.g., via VS Code terminal):
   cd "c:\Users\sahil\OneDrive\Desktop\Devbhoomi DryCleans\dry-cleaning-website"

2. Run the script (it will ask for confirmations):
   .\scripts\push-to-github.ps1

   You can pass a custom remote URL as an argument:
   .\scripts\push-to-github.ps1 -RemoteUrl "https://github.com/YourUser/YourRepo.git"

Safety and recovery:
- The script creates a local branch named `backup-before-push-<timestamp>` before attempting to push.
- If you need to remove the remote branch after a mistaken push (requires push permissions):
  git push origin --delete main
- To undo the local commit (if necessary):
  git log --oneline
  git reset --hard <sha>

If you want me to attempt pushing from here, I cannot perform authenticated network operations from this environment. Instead, run the script above in your terminal; if you get errors, paste the output here and I will help troubleshoot and fix any problems.
