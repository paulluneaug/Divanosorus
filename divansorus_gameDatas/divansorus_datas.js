
/////////////////////////////////////////////////////////////
/// Escapausorus v1 (2020)
///	A quick and dirty framework to create small adventure game (certified vanilla JS)
/// Author: Stéphanie Mader (http://smader.interaction-project.net)
/// GitHub: https://github.com/RedNaK/escaposaurus
///	Licence: MIT
////////////////////////////////////////////////////////////


/*
	HERE IS THE CONFIGURATION OF THE GAME
*/
/*either online with VOD server and JSON load of data
either local */
var isLocal = true;
var gameRoot = "./";
var gameDataRoot = gameRoot + "divansorus_gameDatas/";
var videoRoot = gameDataRoot + "videos/";

/*caller app*/
var contactVideoRoot = videoRoot + "contactVideo/";

/*full path to intro / outro video*/
var missionVideoPath = videoRoot + "introVideo/intro1.mp4";
var introVideoPath = videoRoot + "introVideo/intro2.mp4";
var missingVideoPath = videoRoot + "contactVideo/missing/final.mp4";
var epilogueVideoPath = videoRoot + "epilogueVideo/epiloguecredit.mp4";

/*udisk JSON path*/
var udiskRoot = gameDataRoot + "udisk/";

/*Wether the "incoming call" popup should be skipped*/
var skipIntroConfirmationPopup = true;

/*for online use only*/
/*var udiskJSONPath = gameRoot+"escaposaurus_gamedata/udisk.json" ;
var udiskJSONPath = "/helper_scripts/accessJSON_udisk.php" ;*/

var udiskData =
{
	"root": {
		"folders":
			[
				{
					"foldername": "RENCONTRE",
					"files": ["Un après-midi sur l'eau.png", "Souvenir de sa maison.png", "Vacances avec elle.png", "Celle que j'aime.png"]
				},
				{
					"foldername": "DECHIRURE",
					"password": /(?<!.)florence(?!.)/,
					"sequence": 0,
					"files": ["Que se passe-t-il Marie.jpg", "Souvenir de sa maison.png", "Pourquoi Julie.jpg", "Reponds moi Aurore.jpg", "Tout le monde me lache.png", "Reviens Camille.jpg", "Ca fait mal.png"],
					"folders": [
						{ "foldername": "BLOQUAGE", "password": /0651141412/, "sequence": 2 }
					]
				},
				{
					"foldername": "RAPPEL",
					"password": /(?<!.)((d[eéè]m[eéè]nag(ement|er|[eéè]e?))|(canada)|([eéè]tudes?)|(d[eéè]part))(?!.)/,
					"sequence": 1,
					"files": ["Adresse Dr Feur.jpg", "Les anniversaires.png", "Mot de passe.jpg", "Pour la recontacter.png"],
				}
			],
		"files": 
		[

		]
	}
};

// @TODO : Replace
var gameTitle = "Divanosaurus";
// @TODO : Replace
var gameDescriptionHome = "Thérapie dans le divan";
// @TODO : Replace
var gameMissionCall = "Encore une visite chez le psy";
// @TODO : Replace
var gameMissionAccept = "&raquo;&raquo; Fouiller dans vos souvenirs (JOUER) &laquo;&laquo;";

var gameCredit = "Un jeu conçu et réalisé par : <br/>";
var gameThanks = "Remerciements : <br/> Stéphanie Mader - Framework Escaposorus;)";

var OSName = "CERVEAU";
var explorerName = "MEMOIRE";
var callerAppName = "DISCUSSIONS";

/*titles of video windows*/
var titleData = {};
titleData.introTitle = "INTRODUCTION";
titleData.epilogueTitle = "EPILOGUE";
titleData.callTitle = "Discussion en cours...";

/*change of caller app prompt for each sequence*/
var promptDefault = "Rien à demander, ne pas les déranger.";
var prompt = [];
prompt[0] = "Prendre contact";
prompt[1] = "";
prompt[2] = "";
prompt[3] = "Envoyer la carte";
prompt[4] = "Appeler Nathalie pour savoir où en sont les secours.";

/*when the sequence number reach this, the player win, the missing contact is added and the player can call them*/
var sequenceWin = 3;

/*before being able to call the contacts, the player has to open the main clue of the sequence as indicated in this array*/
/*if you put in the string "noHint", player will be able to immediatly call the contact at the beginning of the sequence*/
/*if you put "none" or anything that is not an existing filename, the player will NOT be able to call the contacts during this sequence*/
var seqMainHint = [];
seqMainHint[0] = "noHint";
seqMainHint[1] = "noHint"; /*if you put anything that is not an existing filename of the udisk, the player will never be able to call any contacts or get helps during this sequence*/
seqMainHint[2] = "noHint";

/*contact list, vid is the name of their folder in the videoContact folder, then the game autoload the video named seq%number of the current sequence%, e.g. seq0.MP4 for the first sequence (numbered 0 because computer science habits)
their img need to be placed in their video folder, username is their displayed name
*/
var normalContacts = [];
normalContacts[0] = { "vid": "Psychologue", "vod_folder": "", "username": "Psychologue", "canal": "video", "avatar": "psychologue_avatar.png" };
normalContacts[1] = { "vid": "Maman", "vod_folder": "", "username": "Maman (téléphone)", "canal": "txt", "avatar": "maman_avatar.png" };

/*second part of the list, contact that can help the player*/
var helperContacts = [];
helperContacts[0] = { "vid": "Psychologue", "vod_folder": "", "username": "Psychologue (pour avoir un indice)", "canal": "txt", "avatar": "albert.png", "bigAvatar": "albertbig.png" };
/*helperContacts[1] = {"vid" : "Lou", "username" : "Lou (pour avoir un deuxième indice) - par message", "canal" : "txt", "avatar" : "Lou_opt.jpg", "bigAvatar" : "avatarHelper2Big.gif"} ;*/


/*ce qui apparait quand on trouve le dernier élément du disque dur*/
finalStepAdded = "Bravo, plus de trauma";

/*the last call, it can be the person we find in the end or anyone else we call to end the quest, allows the game to know it is the final contact that is called and to proceed with the ending*/
var missingContact = { };

/*Lou only send text message, they are stored here*/
var tips = {};
tips['Maman'] = [];
tips['Maman'][0] = "Ta première copine ? Je ne me rappelle plus vraiment. Françoise ? Ou Marie ? Vous étiez partis en vacances ensemble il me semble";
tips['Maman'][1] = "Florence ? Elle avait été accepté dans son école au Canada, non ?";
tips['Maman'][2] = "Son numéro ?  Elle rigolait pas tout le temps en disant que les derniers chiffres correspondaient à l'anniversaire' de Sam ?";

tips['Psychologue'] = [];
tips['Psychologue'][0] = "Vous aviez caché son nom dans un poème ?";
tips['Psychologue'][1] = "Pourquoi avait elle fait ses cartons ? Votre mère n’en a pas parlé ?";
tips['Psychologue'][2] = "";


/*text for the instruction / solution windows*/
var instructionText = {};
instructionText.winState = "Vous avez retrouvé l'id GPS et vous pouvez appeler les secours du secteur.";
instructionText.lackMainHint = "";
instructionText.password = "Vous devez trouver et entrer le mot de passe d'un des dossiers de la boite de droite. Vous pouvez trouver le mot de passe en appelant les contacts de la boite de gauche.<br/>Pour entrer un mot de passe, cliquez sur le nom d'un dossier et une fenêtre s'affichera pour que vous puissiez donner le mot de passe.";

/*please note the %s into the text that allow to automatically replace them with the right content according to which sequence the player is in*/
var solutionText = {};
solutionText.winState = "Si Sabine a été secourue, le jeu est fini bravo.";
solutionText.lackMainHint = "Vous devez ouvrir le fichier <b>%s</b><br/>";
solutionText.password = "Vous devez déverouiller les souvenirs <b>%s1</b><br/>avec le mot de passe : <b>%s2</b><br/>";