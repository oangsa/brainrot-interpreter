script_key="ptyKqDWNCCQrYtUNhcTSSwtXrpxDFwza";
parental_controls = true;
language = "english"; --Set this to: french, german, polish, russian, spanish, turkish, pt-br for a community made translation.

script_id = "53b114ffd7086252ec4651fcf0f05e26";if isfile(string.format("%s-cache.lua",script_id))then pcall(delfile,string.format("%s-cache.lua",script_id))end;getgenv().language=language=="english"and""or language;getgenv().parental_controls=parental_controls;local a=game:HttpGet("https://api.luarmor.net/files/v3/loaders/"..script_id..".lua")pcall(loadstring(a))