import dummyProxy from "./encoding";

const gameFrame = document.getElementById('game-frame') as HTMLIFrameElement;


gameFrame.src = dummyProxy.encodeUrl("https://play.geforcenow.com/mall/#/deeplink?game-id=46bfab06-d864-465d-9e56-2d9e45cdee0a");

