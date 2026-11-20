-- Game: Sample Unity Game
-- Engine: Unity 2021.3, Mono
-- PortXR: 0.2.0
-- Tested: Quest 3, Virtual Desktop
-- Fixes: follows the gameplay camera, hides the vignette quad stuck to it
-- Author: EncidXVII

function on_scene(name)
  if name ~= "Menu" then portxr.set("CameraName", "PlayerCamera") end
end

function on_camera(name)
  if portxr.find("Main Camera/Vignette") then portxr.hide("Main Camera/Vignette") end
end
