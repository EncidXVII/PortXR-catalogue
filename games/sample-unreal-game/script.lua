-- Game: Sample Unreal Game
-- Engine: Unreal Engine 5.4
-- PortXR: 0.2.0
-- Tested: Valve Index, SteamVR
-- Fixes: hides the first-person arms, walks slower for comfort
-- Author: EncidXVII

function on_scene(name)
  if portxr.find("Pawn/Mesh1P") then portxr.hide("Pawn/Mesh1P") end
  if portxr.find("Pawn/CharacterMovement") then portxr.field("Pawn/CharacterMovement", "MaxWalkSpeed", 400) end
end
