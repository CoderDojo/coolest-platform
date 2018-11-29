# Definitions
This document tries to inform our team about what is currently available as variables for email building

## New user
### Variables
 - eventName[string]: Name of the event
 - eventDate[string]: Date of the event
 - eventLocation[string]: Address of the event (CHQ Building, Dublin 1)
 - eventWebsite[string]: Url of the communication website (coolestprojects.org/uk)
 - eventManageLink[string]: Url to manage your projects, or create new ones (registerxxx.coolestprojects.org/)
 - projectName[string]: Name of the project (Scratch goes to space 9000)
 - "int-2018", "na-2019"[boolean]: If "int-2018" is present, that means the event is the international one. If it's "uk-2018", it's the uk one & so on.
 - requiresApproval[boolean]: Allow you to check if the event makes use of "Register" vs "Apply" wording

## Returning user
### Variables

 - link[string]: Url containing the token allowing the user to authentify again 
 - contact[string]: Email of the event (usa@coolestprojects.org)
 - "int-2018", "na-2019"[boolean]: If "int-2018" is present, that means the event is the international one. If it's "uk-2018", it's the uk one & so on.
 - requiresApproval[boolean]: Allow you to check if the event makes use of "Register" vs "Apply" wording

## Confirmation email
### Variables

 - eventName[string]: Name of the event 
 - eventLocation[string]: Address of the event (CHQ Building, Dublin 1) 
 - eventDate[string]: Date of the event
 - eventContact[string]: Email of the event (usa@coolestprojects.org)
 - eventUrl[string]: Url to manage your projects, or create new ones (registerxxx.coolestprojects.org/events/cp-2018)
 - emailIteration[number]: Number of times the confirmation email has been sent
 - projectName[string]: Name of the project (Scratch goes to space 9000)
 - attendingUrl[string]: Url to confirm the project
 - notAttendingUrl[string]: Url to cancel the project 
 - "int-2018", "na-2019"[boolean]: If "int-2018" is present, that means the event is the international one. If it's "uk-2018", it's the uk one & so on.
 - requiresApproval[boolean]: Allow you to check if the event makes use of "Register" vs "Apply" wording

## New admin
Don't touch it unless asked
Thanks :]
