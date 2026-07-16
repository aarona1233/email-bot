// seed-inbox-real.js
// ─────────────────────────────────────────────────────────
// Seeds the inbox with REAL Coalition Space inquiries plus
// a few spam examples for training balance.
//
// Run with dev server running:
//   node seed-inbox-real.js
// ─────────────────────────────────────────────────────────

const ENDPOINT = "http://localhost:3000/api/inbox/receive";

const REAL_INQUIRIES = [
  {
    "from": "jimmy@venturecommercialnyc.com",
    "subject": "40-50 Seat Requirement",
    "body": "Hi Tom, \n\nWe're working with a large team trying to find space - do you have units in this size?\n\nThis user would need to be at your Grand Central location.\n\nCheers,\n--\n\nJimmy Reardon\nManaging Director\nVCNYC\n(m) 484-620-5364"
  },
  {
    "from": "JRosbash@ripcony.com",
    "subject": "462 Seventh Ave",
    "body": "Hi Tom,\n\n \n\nYour partial 6th floor sublease is 9,230 RSF\"\u00a6 \n\n \n\n*\tWhat are you asking?  \n*\tIs there a floor plan as I need to determine the # of offices and conf rooms\n*\tWho is the sublease from?\n*\tI see that the furniture & wiring is in place already\n\n \n\nThanks.\n\n \n\nBest,\n\nJeff\n\n \n\nJeffrey Rosbash | Director, NYC & Metro Markets\n\n \n\nRIPCO Real Estate LLC\n\n150 East 58th Street, New York, NY 10155\n\nD: 646.827.9971 C: 917.991.3124\n\nE: JRosbash@ripcony.com  \n\nwww.ripcony.com"
  },
  {
    "from": "stanley@mbreadvisors.com",
    "subject": "462\"\u201c468 Seventh Ave \"\u201c Suite P6 \"\u201c Floor Plan & Asking Rent (PSF)",
    "body": "Hi Tom,\n\nI have a client who may be a good fit for Suite P6 (6,430 RSF) at 462\"\u201c468 Seventh Ave. Could you please share the floor plan along with the asking rent per square foot?\n\nThanks,\n\nStanley Chisom\nResearch & Leasing Support\nMBRE Advisors LLC\nWorking with Michael Bolton\nwww.mbreadvisors.com"
  },
  {
    "from": "cesar@normanbobrow.com",
    "subject": "462-468 Seventh Ave - Cowork",
    "body": "Hi Tom,\n\nI hope you are doing well, \n\nI have a tenant looking for Coworking space, ideally a couple offices + a few desks.\n\nWhat would be the ask for that requirement?\n\nThanks,\nCesar"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "695 Avenue of the Americas, Suite 505, 5th Floor, New York, NY 10010, United States, PID: 158670",
    "body": "Hi Tom,\n\nWhat's asking for the entire 1,500 RSF? Do you have a floor plan? \n\nThanks,\nDrew\n \nDrew Wiley\nAssociate\nNewmark\n125 Park Ave\nNew York, NY 10017\nUnited States\n(212) 372-2000 (p)\n(503) 505-0527 (m)\nDrew.Wiley@nmrk.com"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "695 Avenue of the Americas, Suite 520, 5th Floor, New York, NY 10010, United States, PID: 158670",
    "body": "I have a creative office looking for a cool space. 2,000sqft plus. How much? pictures? Pantry?\n \nBob Juergens\nLicensed Real Estate Salesperson\nCorbett & Dullea\n115 Broadway, Suite 5th Floor\nNew York, NY 10006\nUnited States\n(212) 203-5338 (p)\n(917) 673-0624 (p)\n(917) 673-0624 (m)\nbob@cdrenyc.com"
  },
  {
    "from": "Scarlett.Cunningham@cushwake.com",
    "subject": "95 Christopher Columbus Dr - Coworking - Jersey City",
    "body": "Hi Tom, \n\n \n\nWe are working with a national client seeking an insulated coworking suite to accommodate approximately 10 people. Please let us know if you have any availability at 95 Christopher Columbus Drive. Our client's timing is in Q1 2026. Planning to send options in the AM, apologies if you have already gotten back to Gray.  Please send a floor plan & pricing or feel free to call me on my cell to discuss further. \n\n \n\nIdeal Layout:\n\n1\"\u201c3 private offices\n\nPrivate conference room\n\nOpen workstations\n\n \n\nThanks! \n\n \n\nScarlett Cunningham\n\nDirector\n\nDirect: 202-495-7052\n\nMobile: 202-213-9208\nscarlett.cunningham@cushwake.com  \n\n2101 L Street NW, Suite 500\nWashington, DC 20037 | USA \ncushmanwakefield.com    \n\nLinkedIn   | Facebook   | Twitter   | YouTube   | Google+   | Instagram  \n\n \n\n \n\nThe information contained in this email (including any attachments) is confidential, may be subject to legal or other professional privilege and contain copyright material, \nand is intended for use by the named recipient(s) only. \n\nAccess to or use of this email or its attachments by anyone else is strictly prohibited and may be unlawful. If you are not the intended recipient(s), you may not use, disclose, \ncopy or distribute this email or its attachments (or any part thereof), nor take or omit to take any action in reliance on it. If you have received this email in error, please notify \nthe sender immediately by telephone or email and delete it, and all copies thereof, including all attachmen"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "95 Columbus, 95 Christopher Columbus Dr, Suite 1620, 16th Floor, Jersey City, NJ 07302, United States, PID: 3308",
    "body": "Hi Tom,\n\nI have a 3,000 SF Waterfront requirement for a Chinese electronics company that is new to the state. Tenant wants move-in ready space and looking for immediate occupancy. They expect to tour sometime December 8-10th. \n\nCan you provide the following for any spaces that could work:\n\"\u00a2\tFloor plans \n\"\u00a2\tAsking rent\n\"\u00a2\tSpace condition\n\"\u00a2\tAsking rent\n\"\u00a2\tParking and costs\n\"\u00a2\tMarketing materials, space photos and virtual tour if available\n\"\u00a2\tTenant wants to be near other Chinese companies. If you have any in the building please identify them.\n\nErin Wenzler\nVice President\nCBRE\n250 Pehle Ave, Suite 600\nSaddle Brook, NJ 07663\nUnited States\n(201) 712-5600 (p)\n(201) 712-5893 (p)\n(201) 615-8761 (m)\nErin.Wenzler@cbre.com\nhttps://www.linkedin.com/in/erin-wenzler-b724115"
  },
  {
    "from": "noreply@mail.hellosign.com",
    "subject": "FW: Everyone has signed Stephen, your renewal agreement for 485 Madison Avenue is here!",
    "body": "Everyone has signed Stephen, your renewal agreement for 485 Madison Avenue is here! \n\n  \n\n \n\n  \n\nSigners \n\nCoalition Space Legal Team (agreements1@microoffice.com  ) \n\nStephen Luterman (stephen.luterman@gmail.com  ) \n\n \n\nYou can view the document as an attachment below (if it's under 25 MB). This document and others can also be accessed by logging in to your Dropbox Sign account  . \n\n  \n\n \n\n \n\n \n\n  \n\n  \n\nWarning: to prevent others from accessing your document, please do not forward this email. \n\n  \n\n \n\n \n\n \n\n  \n\n\t  \n\n \n\n \n\n \n\nThanks,\nThe Dropbox Sign team"
  },
  {
    "from": "email@mail.commercialcafe.com",
    "subject": "Meena Jalloh | 120 W 45th St, NY",
    "body": "View the details to follow up. \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u200c \n\n  \n\n \n\nHi Property manager,  \n\n \n\nA new request was made to schedule a tour at 120 West 45th Street, New York   and is waiting for your confirmation. \n\n \n\nWe know you want to follow-up as soon as possible, so here are the prospect\u2019s details:    \n\n \n\nTimes Square/ Midtown - Monthly Private Office\n\n120 West 45th Street, New York\n\n  \n\n \n\n\u200a\n\n \n\n\t\n\n \n\nTour request time:\n\nWednesday, June 3 (Afternoon)\n\n \n\n\t\n\n \n\nName: \n\nMeena Jalloh\n\n \n\n\t\n\n \n\nCompany \n\nGO Magazine\n\n \n\n\t\n\n \n\n\t\n\n \n\nE-mail: \n\nmeena@gomag.com  \n\n \n\n\t\n\n \n\nPhone:\n\n+13014423657\n\n \n\n\t\n\n \n\n\t\n\n \n\nRequired Workspace Type:\n\nPrivate Office\n\n \n\n\t\n\n \n\n\t\n\n \n\nTeam Size: \n\n4\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\nMonthly Budget:\n\n$2500\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\nLead Notes: \n\nMy name is Meena. I work with GO Magazine, a queer women's publication. We're currently looking to rent a private office space month-to-month that fits 4 employees with a move-in date of July 15th. Windows, security or a doorman and would be great if already furnished with desks! Our budget is $2500, with some wiggle room.\n\n \n\n\t\n\n \n\n \n\nGet more views for your listings across the Comm"
  },
  {
    "from": "adefaison@gmail.com",
    "subject": "RE: $99/ month for conference room",
    "body": "On Apr 2, 2026, at 1:42\"\u00afPM, Dianne Irizarry <dirizarry@coalitionspace.com  > wrote:\n\n\t\u00ef\u00bb\u00bf \n\n\tHi Ade,\n\n\t \n\n\tPlease find attached our Intake Form. Once it is filled out and returned to me, we will create your agreement.\n\n\tThank you. \n\n\t \n\n\tKindly,\n\n\tDianne Irizarry | Community and Sales Manager, Coalition Space"
  },
  {
    "from": "team@tandem.space",
    "subject": "RE: 120 W 45th St, Entire 21st Floor Tour - June 26",
    "body": "Hi Asia, \n\n \n\nHere's Mithat's contact info for the tour on Monday: +16503009389. \n\n \n\nThanks,\n\n \n\n\"\u201d\n\nChrissen\n\nOperations @ Tandem\n\n  \n\n\tOn June 26, 2026 at 2:34 AM GMT+8 team@tandem.space   wrote:\n\n\tPerfect, thanks Asia! Will send over calendar invite. You will be meeting Mithat from Magnos. I'll send a follow up email with their contact info once I hear back.\n\n\t\n\tIf there are any instructions we should relay for access, please let us know. If you need to reach us during the tour, you can reply to this thread or text/call Ethan at 929-529-6282.\n\t\n\tThanks,\n\n\t \n\n\t\"\u201d\n\n\tChrissen\n\n\tOperations @ Tandem\n\n\t \n\n\t\tOn June 26, 2026 at 1:22 AM GMT+8 asia@coalitionspace.com   wrote:\n\n\t\tHi Chrissen! Monday at 10:55am is perfect and we have Dedicated Desks for $450/mo each. I'll include additional photos of the space here, look forward to meeting them soon! \u00f0\u0178\u02dc\u0160"
  },
  {
    "from": "team@tandem.space",
    "subject": "RE: 120 W 45th St, Entire 21st Floor Tour - May 27",
    "body": "Hi Asia, \n\n \n\nThanks, hope you have a good one too.\n\n \n\nBest,\n\n \n\n\"\u201d\n\nChrissen\n\nOperations @ Tandem\n\n  \n\n\tOn May 23, 2026 at 4:46 AM GMT+8 asia@coalitionspace.com   wrote:\n\n\tThank you Chrissen, have a restful holiday weekend! \u00f0\u0178\u02dc\u0160"
  },
  {
    "from": "colleen@hubblehq.com",
    "subject": "RE: 315 West 36th Hubble lead",
    "body": "How is 11 am?\n\n  \n\nColleen Poling \n\nSr. Account Executive / Hubble \n\nWebsite: hubblehq.com   \nEmail: colleen@hubblehq.com   \nPhone: (646) 951 2096 <tel:(646)+951+2096> \nAddress: 60 East 42nd Street New York, New York 10165 \n\n  \n\n \n\n \n\nOn Tue, Apr 14, 2026 at 2:59\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Colleen, absolutely we do! Do you know what time works best for them so that we can give the building a heads up?\n\n\t \n\n\tThank you!"
  },
  {
    "from": "evanfleisch@euno.ai",
    "subject": "RE: 4-person office, 116 W 23rd tour",
    "body": "Can we do 5:30 PM tomorrow?  Im in the area, otherwise more difficult. Would be awesome! \n\n \n\n \n\nEvan Fleisch\n\nHead of Sales\n\nM: +1 914 446 2337 \n\n  \n\n \n\n \n\nOn Tue, Apr 28, 2026 at 3:32\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Evan! 45th Street, just a block away from the Times Square 1 train \u00f0\u0178\u02dc\u0160 I'll also include photos of the offices here and if you're free to check them out, LMK and I can share a tour invite!"
  },
  {
    "from": "hannah.freund@jll.com",
    "subject": "RE: 462-468 7th Ave",
    "body": "Yes, please send us details.\n\nHannah Freund\nAssociate, Brokerage\nJLL\n330 Madison Avenue, 5th Floor\nNew York, NY 10017\nM: +1 203 914 6639\n\nClick here for information regarding the New York State Human Rights Law, as required by the State of New York.\n\njll.com\n\n-----Original Message-----"
  },
  {
    "from": "hannah.freund@jll.com",
    "subject": "RE: 462-468 7th Ave",
    "body": "Hi Tom,\n\nI'm working with a group that needs built, furnished space for a Sept 2026 commencement.\n\nIdeal layout is 12 workstations, 1 office and 1 conference room but 10 workstations and 1 conference room would also suffice. Ideal term is 12-18mo; max they can sign is 2-3 years.\n\nCan you accommodate here? If so, please send details for Suite 320 Suite 315 .\n\nBest,\nHannah Freund\nAssociate\nJLL\nT +1 203-914-6639\n\n[JLL Logo]\nOne of the 2025 World's Most Ethical Companies\u00ae\nJones Lang LaSalle\n\nFor more information about how JLL processes your personal data, please click here\nThis email is for the use of the intended recipient(s) only. If you have received this email in error, please notify the sender immediately and then delete it. If you are not the intended recipient, you must not keep, use, disclose, copy or distribute this email without the author's prior permission. We have taken precautions to minimize the risk of transmitting software viruses, but we advise you to carry out your own virus checks on any attachment to this message. We cannot accept liability for any loss or damage caused by software viruses. The information contained in this communication may be confidential and may be subject to the attorney-client privilege. If you are the intended recipient and you do not wish to receive similar electronic messages from us in the future then please respond to the sender to this effect."
  },
  {
    "from": "Hannah.Freund@jll.com",
    "subject": "RE: 462-468 Seventh Ave - P6",
    "body": "Tom,\n\n \n\nFollowing up here.\n\n \n\nBest,\n\nHannah\n\n \n\nHannah Freund\nAssociate, Brokerage\nJLL\n330 Madison Avenue, 5th Floor\nNew York, NY 10017\nM: +1 203 914 6639 \n\njll.com"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: 462-468 Seventh Ave - P6",
    "body": "Tom,\n\n \n\nI hope you're well. \n\n \n\nI'm putting together a survey for a client who needs ~3-4K SF of prebuilt space. They're looking for a standard mix of a couple of offices, meeting rooms and open area (they are somewhat flexible on layout). Timing is Q2-26. \n\n \n\nCan you please send over details for the abovementioned option?\n\n \n\nBest,\n\nHannah\n\n \n\nHannah Freund\nAssociate, Brokerage\nJLL\n330 Madison Avenue, 5th Floor\nNew York, NY 10017\nM: +1 203 914 6639 \n\njll.com  \n\n \n\n  \nOne of the 2025 World's Most Ethical Companies\u00ae   \nJones Lang LaSalle \n\nFor more information about how JLL processes your personal data, please click here   \nThis email is for the use of the intended recipient(s) only. If you have received this email in error, please notify the sender immediately and then delete it. If you are not the intended recipient, you must not keep, use, disclose, copy or distribute this email without the author's prior permission. We have taken precautions to minimize the risk of transmitting software viruses, but we advise you to carry out your own virus checks on any attachment to this message. We cannot accept liability for any loss or damage caused by software viruses. The information contained in this communication may be confidential and may be subject to the attorney-client privilege. If you are the intended recipient and you do not wish to receive similar electronic messages from us in the future then please respond to the sender to this effect."
  },
  {
    "from": "cesar@normanbobrow.com",
    "subject": "RE: 462-468 Seventh Ave",
    "body": "Hi Asia,\n\nThis is what the are looking for: \n\n*  Budget: $4,000\"\u201c$5,000 per month\n\n*  Space type: A carve-out within a shared office (with a co-tenant)\n\n \n\nLayout needs:\n\n*\tA couple of private offices\n\n*\tA few cubicles\n*\tAccess to shared kitchen, break room, and conference rooms\n\n\t \n\nDo you have anything for them? \n\n \n\nBest, \n\nCesar \n\n \n\nOn Fri, Feb 13, 2026 at 4:12\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Cesar! Could you share more details, like SF/team size, budget, start date, etc so that we can share options? Thank you!"
  },
  {
    "from": "waldman@cogentrealty.com",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401  RESENDING INFORMATION NEEDED",
    "body": "RESENDING INFORMATION NEEDED\n\n-----Original Message-----"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401  RESENDING INFORMATION NEEDED",
    "body": "Dear Tom,\n\nSingle person financial co needs ECONOMICAL WINDOWED OFFICE on January 1.\n\nPlease provide quote.\n\nthank you,\nMitchell Waldman\nPresident\nCogent Realty Advisors\n260 Madison Ave, Suite 8th Floor\nNew York, NY 10016\nUnited States\n(212) 509-4049 (p)\n(917) 533-0166 (m)\nwaldman@cogentrealty.com\nhttps://rentnyoffice.com/\nhttps://www.linkedin.com/in/mitchell-waldman-ab8505b"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "How many offices/conference rooms/ phone booths/ desks does this unit have?\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "I just need to know pricing?\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "Hey Asia just following up on the price and square footage of this space?\n\n \n\nAll the best,\n\nGraham\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "Also what is the square footage?\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "How much would this cost?\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "graham@nomadgroup.io",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "August 1st start date budget is 40-50k\n\n \n\n \n\n  \n\nGraham Janovic\n\n(917) 373 - 0333\n\nAssociate @ Nomad\n\nnomadgroup.io   |   linkedin  \n\n\t\n\n \n\n \n\n________________________________"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 462-468 Seventh Ave, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "Hi Tom,\nLooking for a space with:\n50\"\u201c60 desks (ideally split across two rooms or sections)\n3\"\u201c4 internal meeting rooms\nPhone booths and a small breakout area.\nDo you have any units that could support this?\nthx \nGraham Janovic\nNomad Group\n276 Fifth Ave\nNew York, NY 10001\nUnited States\ngraham@nomadgroup.io"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 462-468 Seventh Ave, Suite 315, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "Tom,\n\nI have a lawyer looking for two offices and a desk for a paralegal?  Is this space built out or just open space?   Do you have anything else in the area that could work?\n\nJordan Oliver\nManaging Director\nReal Estate Strategies, Ltd.\n500 N Broadway, Suite 165\nJericho, NY 11753\nUnited States\n(516) 942-8300 (p)\n(516) 942-8315 (p)\n(516) 941-5866 (m)\njoliver@resltd.com\nhttps://www.linkedin.com/in/jordan-oliver-179a3316/"
  },
  {
    "from": "Reed.Nerlino@cbre.com",
    "subject": "RE: 462-468 Seventh Ave, Suite 320, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "$40 psf or less and 5-8K sf\n\nSincerely,\nReed Nerlino\nWheel Program Associate\nCBRE | Advisory & Transaction Services\n200 Park Avenue | New York, NY 10166\n+1 646-725-3236 | Reed.Nerlino@cbre.com\n\n-----Original Message-----"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 462-468 Seventh Ave, Suite 320, 6th Floor, New York, NY 10018, United States, PID: 157401",
    "body": "I'm representing a tenant requiring an open area for 20-30 people with at least 5 conference rooms/offices.  Could you please provide the following for this suite and anything else you represent in this building or the area:\n1.      Asking rent?\n2.      Possession Date?\n3.      Minimum term considered?\n4.      Any amenities?\n5.      Does furniture and wiring come with the space?\n6.      Can you send floor plans or pictures if not on Costar?\n\nReed Nerlino\nReal Estate Wheel Program Associate\nCBRE\n200 Park Ave\nNew York, NY 10166\nUnited States\n(212) 984-8000 (p)\nReed.Nerlino@cbre.com\nDetails about the personal data CBRE collects and why, as well as your data privacy rights under applicable law, are available at CBRE \"\u201c Privacy Policy."
  },
  {
    "from": "iaudi@openregroup.com",
    "subject": "RE: 462-468 Seventh St - Inquiry",
    "body": "Thanks for getting back to me. Those are out of their price range, is the partial 6th still available at 462-468 Seventh St?"
  },
  {
    "from": "iaudi@openregroup.com",
    "subject": "RE: 462-468 Seventh St - Inquiry",
    "body": "Hi Tom,\n\n \n\nI hope this email finds you well. What are you asking for the 2,790-6,430 SF partial 6th floor at 462-468 Seventh Ave ? We have a nonprofit client who is seeking a 5-10 year term for their client facing space.\n\nCan you please send floorplans of the installment? Would ownership be willing to modify?\n\nThanks,\nIsabella\n\n \n\nThis email is for the use of the intended recipient(s) only. If you have received this email in error, please notify the sender immediately and then delete it. If you are not the intended recipient, you must not keep, use, disclose, copy or distribute this email without the author's prior permission. We have taken precautions to minimize the risk of transmitting software viruses, but we advise you to carry out your own virus checks on any attachment to this message. We cannot accept liability for any loss or damage caused by software viruses. The information contained in this communication may be confidential and may be subject to the attorney-client privilege. If you are the intended recipient and you do not wish to receive similar electronic messages from us in the future then please respond to the sender to this effect. \nJLL_2025"
  },
  {
    "from": "Ramsey.Feher@cbre.com",
    "subject": "RE: 485 Mad",
    "body": "Thanks, Asia!   It is most likely just a little too far from Rock Center but will keep it in mind.\n\n \n\nRamsey Feher | Senior Vice President  \nCBRE, Inc. | Advisory & Transaction Services\n200 Park Avenue, 21st Floor | New York, NY 10166 \nT 212 984 8338 |  C 201 394 3411\nramsey.feher@cbre.com   | www.cbre.com/ramsey.feher  \n\nPlease consider the environment before printing this email. \n\nThis email may contain information that is confidential or attorney-client privileged and may constitute inside information. The contents of this email are intended only for the recipient(s) listed above. If you are not the intended recipient, you are directed not to read, disclose, distribute or otherwise use this transmission. If you have received this email in error, please notify the sender immediately and delete the transmission. Delivery of this message is not intended to waive any applicable privileges."
  },
  {
    "from": "Ramsey.Feher@cbre.com",
    "subject": "RE: 485 Mad",
    "body": "Asia - \n\n \n\nHope this finds you well!\n\n \n\nWe are looking for space for 25 people near Rock Center, with a possible preference to 485 Madison and open to other suggestions.\n\n \n\nPlease let us know what you have and what I should include in my book to our client.\n\n \n\nRamsey\n\n \n\n \n\n \n\n \n\n \n\n \n\nRamsey Feher | Senior Vice President  \nCBRE, Inc. | Advisory & Transaction Services\n200 Park Avenue, 21st Floor | New York, NY 10166 \nT 212 984 8338 |  C 201 394 3411\nramsey.feher@cbre.com   | www.cbre.com/ramsey.feher  \n\nPlease consider the environment before printing this email. \n\nThis email may contain information that is confidential or attorney-client privileged and may constitute inside information. The contents of this email are intended only for the recipient(s) listed above. If you are not the intended recipient, you are directed not to read, disclose, distribute or otherwise use this transmission. If you have received this email in error, please notify the sender immediately and delete the transmission. Delivery of this message is not intended to waive any applicable privileges.\n\n \n\nDetails about the personal data CBRE collects and why, as well as your data privacy rights under applicable law, are available at CBRE \"\u201c Privacy Policy."
  },
  {
    "from": "Sammy.Elidrissi@hudabeauty.com",
    "subject": "RE: 485 Madison - Floor 7",
    "body": "Hi Asia \n\n \n\nFollowing up so we can go ahead and book the space\n\n \n\nThanks! \n\n \n\nSAMMY ELIDRISSI | PEOPLE MANAGER - US\n\n  \n\n               \n\nCONFIDENTIALITY NOTE: The information contained in this e-mail message and any attachments is highly confidential information intended only for the use of the individual or entity to whom it is addressed. If the reader of this message is not the intended recipient, you are hereby notified that any dissemination, distribution or copy of this message or its attachments is strictly prohibited. If you have received this e-mail in error, please immediately notify us by email and delete the message. Thank you.\n\n \n\n \n\n________________________________"
  },
  {
    "from": "Sammy.Elidrissi@hudabeauty.com",
    "subject": "RE: 485 Madison - Floor 7",
    "body": "Hi Asia,\n\n \n\nHope you are doing well.\n\n \n\nWe are looking to rent the space on October 6, 7, 8, 14, 15, 16 \"\u201c can you please let me know what the pricing looks like for this?\n\n \n\nThanks,\n\nSammy \n\n \n\nSAMMY ELIDRISSI | PEOPLE MANAGER - US\n\n  \n\n               \n\nCONFIDENTIALITY NOTE: The information contained in this e-mail message and any attachments is highly confidential information intended only for the use of the individual or entity to whom it is addressed. If the reader of this message is not the intended recipient, you are hereby notified that any dissemination, distribution or copy of this message or its attachments is strictly prohibited. If you have received this e-mail in error, please immediately notify us by email and delete the message. Thank you."
  },
  {
    "from": "Sammy.Elidrissi@hudabeauty.com",
    "subject": "RE: 485 Madison - Floor 7",
    "body": "Thank you so much \"\u201c looking forward to it!\n\n \n\n \n\nSAMMY ELIDRISSI | PEOPLE MANAGER - US\n\n  \n\n               \n\nCONFIDENTIALITY NOTE: The information contained in this e-mail message and any attachments is highly confidential information intended only for the use of the individual or entity to whom it is addressed. If the reader of this message is not the intended recipient, you are hereby notified that any dissemination, distribution or copy of this message or its attachments is strictly prohibited. If you have received this e-mail in error, please immediately notify us by email and delete the message. Thank you."
  },
  {
    "from": "Sammy.Elidrissi@hudabeauty.com",
    "subject": "RE: 485 Madison - Floor 7",
    "body": "Hi Asia,\n\n \n\nDoes 12:15Pm work tomorrow? \n\n \n\nSAMMY ELIDRISSI | PEOPLE MANAGER - US\n\n  \n\n               \n\nCONFIDENTIALITY NOTE: The information contained in this e-mail message and any attachments is highly confidential information intended only for the use of the individual or entity to whom it is addressed. If the reader of this message is not the intended recipient, you are hereby notified that any dissemination, distribution or copy of this message or its attachments is strictly prohibited. If you have received this e-mail in error, please immediately notify us by email and delete the message. Thank you.\n\n \n\n \n\n________________________________"
  },
  {
    "from": "Sammy.Elidrissi@hudabeauty.com",
    "subject": "RE: 485 Madison - Floor 7",
    "body": "Hello,\n\n \n\nHope you are doing well.\n\n \n\nI was interested in booking the space that was shown for 25 people. We are currently new tenants at 485 Madison on the 17th Floor, but our office is still currently under construction.\n\n \n\nWe are looking to rent a space for October 7th, 8th, and 9th \"\u201c and October 14th, 15th and 16th.\n\n \n\nThe ad says that the office accommodates 25 people but, in the information, it says 1-10.\n\n \n\nCan you please give me a bit more information on the accommodation and more pictures?\n\n \n\nAlso, would it be possible to visit the space on Thursday, October 2nd?\n\n \n\nThanks,\n\nSammy Elidrissi \n\n \n\n \n\n \n\nSAMMY ELIDRISSI | PEOPLE MANAGER - US\n\n  \n\n               \n\nCONFIDENTIALITY NOTE: The information contained in this e-mail message and any attachments is highly confidential information intended only for the use of the individual or entity to whom it is addressed. If the reader of this message is not the intended recipient, you are hereby notified that any dissemination, distribution or copy of this message or its attachments is strictly prohibited. If you have received this e-mail in error, please immediately notify us by email and delete the message. Thank you."
  },
  {
    "from": "mavila@optimistconsulting.com",
    "subject": "RE: 485 Madison Ave - Windowed Team Space Inquiry",
    "body": "Hello!\n\nI hope this message finds you well. I am currently gathering information on office space and would greatly appreciate if you could provide quotes only, directly addressing the points below:\n\n1.\tAverage monthly cost for an office that accommodates 20\"\u201c25 people.\n\n2.       A list of amenities included.\n\n3.       Details on the conference room, bathrooms, and desk setup.\n\n4.       Pricing for 2-day and 5-day work schedules, including:\n\no    Whether pricing decreases if the office is used only twice a week instead of the full week.\n\no    Whether a monthly commitment is possible. If not, please provide the contract terms.\n\nTo help us review efficiently, I kindly ask that your response be limited to quotes and direct answers to the items above.\n\nThank you in advance for your time and assistance.\n\nBest regards,\n\nMichael\n\n--\n\nMICHAEL AVILA\nOFFICE ADMINISTRATIVE MANAGER\n551.404.1549 \"\u00a2 mavila  @optimistconsulting.com  \n\n  \n\noptimistconsulting.com  \n\n36 East 20th Street, 2nd Floor\n\nNew York City, 10003"
  },
  {
    "from": "colleen@hubblehq.com",
    "subject": "RE: 485 Madison Ave Lead from Closing Regus @ 477 Madison Ave",
    "body": "Hi Asia and Diane, \n\n \n\nI am actually waiting to hear back from him with his email address so I can share more details. I will share this with you as soon as I receive it! \n\n \n\nI wanted to check in about the tour with Andrea for last week - were you or Tom able to share the agreement with her? I know shes excited to move forward! \n\n \n\nSpeak soon! \n\n \n\nOn Fri, Apr 17, 2026 at 4:39\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Colleen, thank you for sending that lead over to us yesterday! By chance do you have their name or contact details if we need to send over more information of the spaces he saw?\n\n\t \n\n\tThank you!"
  },
  {
    "from": "glennt@rimanhattanrealty.com",
    "subject": "RE: 485 Madison Ave. - Tenant Inquiry",
    "body": "Hi Asia,\n\nI tried reaching you over the phone but left a voicemail regarding 485 Madison Ave.  7th Floor (100-7,500 SF)\n\nMy tenant is a luxury handbag authentication company from Ginza, Japan. The space would be used as a high-end showroom and office for existing VIP clients, with no general retail traffic. Please see their website for reference: https://ginzaxiaoma.com  .\n\nTheir requirements are as follows:\n\n*\t1,000 SF \"\u201c 2,500 SF\n*\tClass A building\n*\tBudget up to $30,000/month\n*\tSecurity/attended lobby preferred\n*\tTerm and move-in date TBD\n\nPlease let me know if this use would be acceptable to ownership. If so, could you share the asking, and if it is divisible into 2,500 SF. Also, when will the sublease expire?\n\nKind regards,\n\nGlenn V. Tojoy\"\u00a8\nOffice & Retail Leasing | Tenant Representation\nRI Manhattan Realty\n\nLicensed Real Estate Salesperson \"\u201c State of New York\n\n37 W 47th Street NY, NY 10036\nM 646-982-8131 | Tel: 212.581-3003\nE: Glennt@rimanhattan.com  \nhttps://www.retail-officespace.com"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 485 Madison Ave, 7th Floor, New York, NY 10022, United States, PID: 157347",
    "body": "Good Morning Asia,\n\nCan you share what you have for 5-8 people who need 1-2 offices and bullpen of sorts?\n\nphotos?\nasking?\n\nThanks,\n\nMarcus Craddock\nSenior Advisor\nCresa\n1133 Avenue of the Americas, Suite 2900\nNew York, NY 10036\nUnited States\n(212) 758-3131 (p)\n(240) 372-7079 (p)\n(240) 372-7079 (m)\nmcraddock@cresa.com\nhttps://www.linkedin.com/in/marcus-craddock-770b0735/"
  },
  {
    "from": "KRuderman@savills.us",
    "subject": "RE: 485 Madison Ave,",
    "body": "Hi I'm interested in including your space in a tour book for a group needing space by 1 Q 2026\n\n \n\nCan you please send me your flyer (or pictures or floor plan etc)...who is it a sublease from and pricing please?\n\n \n\nThank you\n\n \n\n \n\n\t\n\n \n\nKen Ruderman\n\nVice Chairman\n\nSavills, 399 Park Avenue, 11th Floor, New York, NY 10022\n\n  \n\nTel\nMobile\nWebsite\n\n: +1 212 326 1020 <tel:+12123261020> \n: +1 917 743 8829 <tel:+19177438829> \n: www.savills.us"
  },
  {
    "from": "daniel@officefreedom.com",
    "subject": "RE: 485 Madison",
    "body": "Thanks Asia\n\n \n\nAre 12,13 and 14 separate offices?\n\nCan you kindly send me photos of the offices as well.\n\n \n\nThanks \n\n \n\nDan\n\n \n\nDaniel Soffer\n\nPresident - Global Real Estate\n\n \n\nFree Service \"\u201c finding you the right office at the right price \n\nBrokering Office Transactions in over 120 Countries  \n\nwww.officefreedom.com  \n\nD: +1 646 403 3032\n\nM: +1 646 648 2694\n\nConnect on LinkedIn"
  },
  {
    "from": "daniel@officefreedom.com",
    "subject": "RE: 485 Madison",
    "body": "Vanessa Collins - Ben Heathorn. Joss Search. Looking to tour July 14th.\n\nClient I previously placed at WeWork 575 Lexington is looking for new space as they have expanded.\n\n\"\u00a2 Spacious windowed 15-desk office\n\"\u00a2 Midtown, surrounds\n\"\u00a2 Ready to move into, 12 month term\n\"\u00a2 Start in Sept\n\nBudget $6000/month\n\nPlease provide me with options I can share with the client, including a floor plan and photos of actual offices.\n\nThanks, Dan\n\n \n\nDaniel Soffer\n\nPresident - Global Real Estate\n\n \n\nFree Service \"\u201c finding you the right office at the right price \n\nBrokering Office Transactions in over 120 Countries  \n\nwww.officefreedom.com  \n\nD: +1 646 403 3032\n\nM: +1 646 648 2694\n\nConnect on LinkedIn"
  },
  {
    "from": "Caroline.Chmelko@cbre.com",
    "subject": "RE: 695 Avenue of the Americas",
    "body": "Hi Tom  -\n\n \n\nWe have the below requirement for a financial firm we represent. Can you share details on the partial 5th floor suites you have here?\n\n \n\n*\tSize: 1,000-2,000 RSF \n*\tHeadcount / Layout: 3 offices, 3-4 workstations, 1 conference room\n*\tTiming: in space by Q42025\n*\tTerm: 1-2 years \n*\tFurnished/Wired\n\n \n\nThanks!\n\n \n\nCaroline Chmelko\n\nClient Services Specialist\n\nCBRE | Advisory & Transaction Services\n200 Park Avenue | New York, NY 10166\nT 212.984.8159 \n\ncaroline.chmelko@cbre.com  \n\n \n\nDetails about the personal data CBRE collects and why, as well as your data privacy rights under applicable law, are available at CBRE \"\u201c Privacy Policy."
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 695 Avenue of the Americas, 5th Floor, New York, NY 10010, United States, PID: 158670",
    "body": "Tom-\n\nWe have a group looking for 25 seats in Chelsea.\n\nCan you accommodate here?\n\nThanks,\n \nLuke Dillmeier\nReal Estate Associate\nTranswestern Real Estate Services\n575 Fifth Ave\nNew York, NY 10017\nUnited States\n(212) 537-7700 (p)\n(212) 537-7686 (p)\n(479) 430-9706 (m)\nluke.dillmeier@transwestern.com"
  },
  {
    "from": "Charles.P.Laginestra@cbre.com",
    "subject": "RE: 695 Avenue of the Americas, Suite 530, 5th Floor, New York, NY 10010, United States, PID: 158670",
    "body": "Tom,\n\nFollowing up on the below. Please advise.\n\nThank you,\nCharlie\n\nCharles P. Laginestra\nSenior Vice President\nCBRE | Advisory & Transaction Services\n200 Park Avenue, 22nd Floor | New York, NY 10166\nT +1 212 984 8383 | C +1 201 446 5207\ncharles.p.laginestra@cbre.com | LinkedIn\n\nFollow CBRE: CBRE.com | LinkedIn | Twitter | Instagram | Facebook\n______________________________________________________________\nPlease consider the environment before printing this email.\n\nThis message and any attachments may be privileged, confidential or proprietary. If you are not the intended recipient of this email or believe that you have received this correspondence in error, please contact the sender through the information provided above and permanently delete this message.\n\n-----Original Message-----"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 695 Avenue of the Americas, Suite 530, 5th Floor, New York, NY 10010, United States, PID: 158670",
    "body": "External\n\n Good evening,\n\nI'm working with a firm looking for 12-16k SF of built space that can accommodate 1-2 offices, 4-6 conference rooms and 80-90 workstations. We need to execute a lease and move in by the end of the year. We are looking for a 2-3 year term.\n\nPlease provide details for all applicable units within this building, including pricing, and photos and floor plans if not included on costar.\n\nThank you,\nCharlie\n\nCharles Laginestra\nSenior Vice President\nCBRE\n200 Park Ave\nNew York, NY 10166\nUnited States\n(212) 984-8000 (p)\n(212) 984-8383 (p)\n(201) 446-5207 (m)\ncharles.p.laginestra@cbre.com\nhttps://urldefense.com/v3/__https://www.linkedin.com/in/charleslaginestra__;!!GnpIGg!Y-L4sihFoBzTaBfmgR1elUbv-zx8344T8aiY1olzueg28xCTLXI7e4kaofQ6Wl5K8KC85lDI1spq3K9s8LciLen2xd2ilA$\nDetails about the personal data CBRE collects and why, as well as your data privacy rights under applicable law, are available at CBRE \"\u201c Privacy Policy."
  },
  {
    "from": "rich@lresolutions.com",
    "subject": "RE: 95 Columbus, 95 Christopher Columbus Dr, Suite CW, 16th Floor, Jersey City, NJ 07302, United States, PID: 3308",
    "body": "Yes. Can you provide that?\n\nBest,\nRich\n\nRich Garchar\n\nLRE Solutions, Inc.\nPresident\nDesignated Managing Broker\n312-882-0072\n\n-----Original Message-----"
  },
  {
    "from": "no-reply@c2c.costarmail.com",
    "subject": "RE: 95 Columbus, 95 Christopher Columbus Dr, Suite CW, 16th Floor, Jersey City, NJ 07302, United States, PID: 3308",
    "body": "Hi Tom,\n\nIs this space still available? I have a user that need one desk and has a few filing cabinets. Budget is $400-$500; 200-300 sf.....\n\nThanks,\nRich\n \nRichard Garchar\nPresident\nLRE Solutions, Inc.\n(312) 882-0072 (p)\n(312) 882-0072 (m)"
  },
  {
    "from": "megjamison@sustainablecities.org",
    "subject": "RE: A customer have sent you a message",
    "body": "Yes thank you! I'm going into a meeting now but will pay asap\n\nThanks!\n\nMeg\n\n \n\nMeg Jamison (she/her)\n\nManaging Director, Operations and Impact\n\nSustainable Cities Fund\n\nmegjamison@sustainablecities.org  \n\n \n\n \n\nOn Mon, Jul 14, 2025 at 9:23\"\u00afAM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tGood morning Meg, thank you for connecting with me just now!\n\n\t \n\n\tWe do have a 4-Person Conference Room that is available for your team all-day on the 17th, and both the 4-Person Conference Room and 12-Person Conference Room free up on the 18th. Our rates are $50/hr, so the total for 1.5 days would be $600.\n\n\t \n\n\tIf you'd like to proceed with this booking, you are welcome to make payment here   using our POS portal. \n\n\t \n\n\tPlease reach out if you have further questions!"
  },
  {
    "from": "adam.berenson@gmail.com",
    "subject": "RE: Adam | 462 Seventh Ave, NY",
    "body": "i am open, but have a budget of 2500 per month....so please keep that in mind.\n\n \n\nOn Mon, Aug 11, 2025 at 3:54\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Adam, got it! Would you want options for just 462 Seventh Avenue, or are you open to our other locations as well? The office I'm at, Tower 45, is about a 7-minute walk from 462 Seventh Avenue and has incredible views from the 21st Floor. LMK!"
  },
  {
    "from": "tm@noahre.com",
    "subject": "RE: COALITION: New Requirement | 116 W 23rd Street",
    "body": "Hi Spencer,\n\nWe're currently working with our client who has the following requirements:\n\n*\tPrivate office for 3-4 desks\n*\tBudget: Approximately $3,000/month\n*\tAugust 1st move-in\n\nCould you please send over a proposal if you have anything that might align, specifically at 116 W 23rd Street?\n\nThanks,\nShelly\n\n \n\n  \n\n\t\n  \n\n\t  \n\n\t  \n\n\t  \n\n\t\n\t\nShelly Miano\n\nTransaction Manager \n\n\t\n\t\n\t\n\n \n\n  \n\n(646) 661-3 <tel:+12129477120> 926\n\n  \n\ntm@noahre.com  \n\n  \n\nnoahre.com\n\n  \n\n600 Fifth Ave, 2nd Fl, NY, NY 10020"
  },
  {
    "from": "joshuag@office-hub.com",
    "subject": "RE: CONCERNING OFFICE HUB LEAD ADRIAO FERREIRA",
    "body": "HI TEAM. URGENT UPDATE AND GOOD NEWS. \u00f0\u0178\u0161\u00a8\n\n \n\nLike I mentioned to Asia,  client loved the space and wants to move forward. \n\n \n\nHere is their counteroffer: They were wondering if you can give them a deal for the 6 person office for $2,000 a month flat for a one-year lease. They said if you can give them this deal they will sign immediately and move in. \n\n \n\nThey would also appreciate it very much and be thankful for the discount. They wanted me to let you know that they plan to stay long-term, more then a year. So if you can give them $2,000 for the first year, you can increase the rate in the second year as they plan to continue growing :) \n\n \n\nPlease let me know as soon as possible as they want an answer today and wish to move forward asap. \n\n \n\n \n\nOn Mon, Jun 22, 2026 at 3:08\"\u00afPM Joshua Guzman <joshuag@office-hub.com  > wrote:\n\n\tHi Asia \n\n\t \n\n\tForgot to mention: His budget is $2,300 or below. A year lease. The cheaper the better.  Let me know the best rate you can give him!\n\n\t \n\n\t I'll await your email:) \n\n\t \n\n\tOn Mon, Jun 22, 2026 at 10:29\"\u00afAM Joshua Guzman <joshuag@office-hub.com  > wrote:\n\n\t\tCan you create it and just cc all of us? \n\n\t\t \n\n\t\tHe will be there right at 2pm!  In the system we use we don't send team invites since we are the broker lol\n\n\t\t \n\n\t\tOn Mon, Jun 22, 2026 at 10:21\"\u00afAM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\t\t\tThank you! Could you please share a Calendar invite to our Director, Tom, copied here? He will be the person meeting with Leonardo and"
  },
  {
    "from": "casey@booment.com",
    "subject": "RE: Casey | 95 Christopher Columbus Dr",
    "body": "Hi Asia,\n\nThanks for reaching out, and I appreciate the pictures and the follow-up. We've decided to go with a different space in the area. The main difference is that it offers one large conference room along with a co-working environment for breakout sessions, so we won't feel too siloed in a single room.\n\nThank you again for your time and for sending these over. I really appreciate it and will happily reach out should anything change in the future. \n\nCasey\n\n \n\nOn Tue, Jun 23, 2026 at 2:48\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Casey, hope your week's off to a great start! Checking in if you have any questions or if you'd like us to take care of that booking for you."
  },
  {
    "from": "phillis.chan@bigapplebuddy.com",
    "subject": "RE: Contact form from Phillis from coalitionspace.com",
    "body": "Thanks Asia!\n\n \n\nGrand Central, Times Square or Penn Station could work. \n\n \n\nWe're getting quotes of around $1500 for a space of that size at the moment so we'd be looking for something in that ballpark.\n\n \n\nThanks in advance!\n\n \n\nCheers\n\nPhillis\n\n \n\nOn Fri, Mar 13, 2026, 8:46\"\u00afAM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tGood morning Phillis! \n\n\t \n\n\tWe can accommodate at any of our locations, would love to learn more about what you're looking for so we can put together some options. Did you have a budget that works best for you or have any location preferences?\n\n\t \n\n\tLooking forward to connecting with you!"
  },
  {
    "from": "rathnaramesh16@gmail.com",
    "subject": "RE: Contact form from Rathna from coalitionspace.com",
    "body": "Hi Asia,\n\n \n\nI'd love to do a tour on Wednesday of the Times Square location (I'm also open to Grand Central) -- the primary decision factors for me between the two locations would be pricing and space for zoom calls. Should I schedule a tour through Calendly?\n\n \n\nThanks,\n\nRathna\n\n \n\nOn Mon, Jun 8, 2026 at 4:18\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Rathna, absolutely! Either date is fine, happy to secure a time once the date gets closer. Safe travels and we look forward to meeting you soon! \u00f0\u0178\u02dc\u0160"
  },
  {
    "from": "Lauren.DeSantis@jll.com",
    "subject": "RE: Coworking Availability - Midtown",
    "body": "Thanks again! Do you also have a floor plan you could share?\n\n \n\nLauren DeSantis\n\nSales Coordinator | Licensed Real Estate Salesperson\n\nJones Lang LaSalle I JLL\n\n330 Madison Avenue, 5th Floor I New York, NY 10017\n\n(443) 875 - 4255 I lauren.desantis@jll.com  \n\n \n\nClick here   for information regarding the New York State Human Rights Law, as required by the State of New York."
  },
  {
    "from": "Lauren.DeSantis@jll.com",
    "subject": "RE: Coworking Availability - Midtown",
    "body": "Thanks, Asia! What's the exact RSF for the 6 person office?\n\n \n\nLauren DeSantis\n\nSales Coordinator | Licensed Real Estate Salesperson\n\nJones Lang LaSalle I JLL\n\n330 Madison Avenue, 5th Floor I New York, NY 10017\n\n(443) 875 - 4255 I lauren.desantis@jll.com  \n\n \n\nClick here   for information regarding the New York State Human Rights Law, as required by the State of New York."
  },
  {
    "from": "Lauren.DeSantis@jll.com",
    "subject": "RE: Coworking Availability - Midtown",
    "body": "Hi Asia,\n\n \n\nGreat! Could you please send further details on both?\n\n \n\nThanks,\n\n \n\nLauren DeSantis\n\nSales Coordinator | Licensed Real Estate Salesperson\n\nJones Lang LaSalle I JLL\n\n330 Madison Avenue, 5th Floor I New York, NY 10017\n\n(443) 875 - 4255 I lauren.desantis@jll.com  \n\n \n\nClick here   for information regarding the New York State Human Rights Law, as required by the State of New York."
  },
  {
    "from": "daniel@queenequities.com",
    "subject": "RE: Intake Form for Coalition Space 485 Madison Avenue",
    "body": "Thanks, Asia. Noted on above. Awaiting new agreement. On a bit of a time crunch here to get my stuff out of my old office and into 485 so would appreciate finalizing this ASAP.\n\n\"\u2039\n\n\"\u2039\n\n\"\u2039\n\n\"\u2039\n\n\tOn Thu, 30 Apr 2026 18:49:44 GMT Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Daniel! Happy to take care of these questions and update your agreement accordingly\"\u201d\n\n\t \n\n\t*\tSecurity deposit auto-adjustment (Section 13). The deposit auto-adjusts to twice the monthly fee any time the License Fee changes. This shouldn't be there. This is in reference to if you ever decide to expand to a larger office. For example, if you wanted to take on a larger $3,000/mo office that became available, the SD is referring to the additional amount to match the value of that office. So if you're at $2,100/mo in SD and wanted the $3,000/mo, the second SD would be $900 to equal the value of the new office. That's all what that means in terms of two SDs.\n\t*\tAutomatic Virtual Office on termination. Buried in the definitions \"\u201d terminating the physical license auto-enrolls me in a three-month Virtual Office plan. I'd like this struck or an opt-out noted in the addendum. I can confirm for know that a virtual office will not be necessary at any point in time. We accept your request and will write this in the addendum.\n\t*\tFive-day relocation right (Section 8). None of the other Coalition portfolio buildings work for me, so if for any reason this center closes and I need to be relocated, I'd want to be releas"
  },
  {
    "from": "leads@loopnet.com",
    "subject": "RE: Jace Dinkel favorited 1660 Lincoln St",
    "body": "Your Listing Is Getting Noticed! \n\nHi Asia, \n\nYour listing has been favorited by Jace Dinkel. \n\nBelow is the contact information if you would like to follow up. \n\n  \n\njace.dinkel@pason.com   \n\n  \n\n+1 970-966-5419 <tel:+1%20970-966-5419>  \n\n  \n\n  \n\n100 SF - 16,000 SF of Rocky Mountain Offices!  |  1660 Lincoln St \nDenver, CO 80264 \n\n \n\nOffice For Lease \n\nTo explore additional activity this listing has received, view the full listing performance report. \n\n________________________________\n\nIs this email helpful? \n\n  \n\n  \n\n  \n\n  \n\n  \n\n  \n\n  \n\n \n\n \n\n \n\n\u00a9 2026 CoStar Group, Inc.\n1201 Wilson Boulevard, Arlington, VA 22209\nPrivacy Policy     |  Subscription Center   \n\nReference code: 9-A1078217702-LNFM-DNA-ENUS"
  },
  {
    "from": "jaiveer.singh@spare-it.com",
    "subject": "RE: Jaiveer | 95 Christopher Columbus Dr, NJ",
    "body": "Unfortunately tomorrow does not work for me. Could we do Friday? \nAlso, was Tom the manager of that space last year? \n\n \n\n \n\nJaiveer Singh (He/him)\n\nSustainability & Operations Manager\n\n  \n\nMore Data, Less Waste\n\nWebsite   | LinkedIn  \n\n \n\n \n\nOn Wed, Jun 24, 2026 at 11:02\"\u00afAM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Jaiveer, good to hear! You'll be meeting with our Director, Tom. Does 12pm or 2pm work for you tomorrow?"
  },
  {
    "from": "kellyliangy@gmail.com",
    "subject": "RE: Kelly Liang | 95 Christopher Columbus Dr",
    "body": "Hi Asia and team,\n\n \n\nWe have an additional question:\n\n \n\nIf we decide to terminate the lease, how many days in advance do we need to send out written notice to your leasing team, thus we can get the deposit back? According to the legal, we didn't see it specified in the lease agreement.\n\n \n\nCould you clarify thanks.\n\n \n\n \n\nThanks,\n\nKelly Liang\n\n347-267-4672\n\n \n\n\tOn Jun 19, 2026, at 1:13\"\u00afPM, Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\t \n\n\tHi Kelly, thank you! It should be $909.95. Re-sending now."
  },
  {
    "from": "lamin@boomai.co",
    "subject": "RE: Lamin | 315 W 36th St",
    "body": "Thanks Asia. I will fill this out this afternoon. \n\n  \n\n \n\nBest,\n\n \n\nLamin Darboe\n\nCEO, Boom AI\n\nAI-Powered Document Intelligence for Commercial HVAC Estimators\n\n  \n\n \n\nOn Thu, May 28, 2026 at 12:05\"\u00afPM, Asia Lopez <asia@coalitionspace.com  > wrote: \n\n\tHi Lamin, thank you for stopping by and glad you were able to meet with Tom! I wanted to follow up with additional details for our 36th Street location:\n\n\t \n\n\tSmall Private Office \"\u201d $350/mo for 3 months, then $400/mo for MTM\n\n\t*\tProfessional business address\n\t*\tMail and package handling\n\t*\tComplimentary Wi-Fi\n\t*\t24/7 access to fully furnished private office space\n\t*\t8 conference room hours per month, with the flexibility to book at all Coalition Space locations\n\n\t \n\n\tAll agreements are rolling, so when you're ready to end your membership, we require 30 days' notice on the first of the month. Anything after rolls into the next term.\n\n\t \n\n\tFor move-in, we require:\n\n\t*\tFirst month's rent\n\t*\tSecurity deposit equal to one month's rent\n\t*\tKeycard fee\n\t*\tCertificate of Insurance, if you are using a moving company\n\n\t \n\n\tPlease note that keycards, listed as Premium Portal Access Fees, are charged by the building at $9.95/month per person on your team. New hire keycards are $19.95 each, and replacement keycards are $75 each. When you're ready to move forward, please complete the attached New Member Intake Form.\n\n\t \n\n\tFeel free to reach out with any questions, we'd love to have you with us!"
  },
  {
    "from": "joshuag@office-hub.com",
    "subject": "RE: Leonardo | 95 Christopher Columbus Dr",
    "body": "Awesome, Asia. Can you send me a copy as well? \n\n \n\nI have a call with him to go over everything to get this done and pushed over the line!\n\n \n\n \n\nOn Mon, Jun 29, 2026 at 12:17\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Josh, thank you for checking in! Yes, the agreement has been sent out, just waiting for a signature \u00f0\u0178\u02dc\u0160"
  },
  {
    "from": "monaquipy@yahoo.com",
    "subject": "RE: MPGlobal",
    "body": "Asia,\n\n \n\nHow do I get the link to pay the rent.  Flight delayed....dont want to pay late fee.  I will be online very early tmwr.\n\n \n\nThanks\n\n \n\nMonaqui Porter Young\n\nhttp://www.srina.com\n\n646.552.3794\n\n \n\n \n\n \n\nOn Monday, June 1, 2026 at 04:04:40 PM EDT, Asia Lopez <asia@coalitionspace.com  > wrote: \n\n \n\n \n\nHi Monaqui, hope you\u2019re enjoying the spring weather!\n\n \n\nWanted to check in, were you able to receive your renewal agreement? Happy to send it over again, should look like this:\n\n \n\n \n\nThank you!"
  },
  {
    "from": "monaquipy@yahoo.com",
    "subject": "RE: MPGlobal",
    "body": "Thanks Tom.  I appreciate your suggestions and I 100% understand the facility expenses and the need for rent increase. Question, to ensure I have all options on the table as we move forward in September.  \n\nYou mentioned there are offices near 34 St (I think).  Do you have offices that range in the $1,000-1,400 range?  We are happy with the 45th St location but I like having all options available.    \n\n \n\nThanks so much\n\n \n\nBest Regards,\n\nMonaqui\n\n \n\nMonaqui Porter Young\n\nhttp://www.srina.com\n\n646.552.3794\n\n \n\n \n\n \n\nOn Tuesday, May 26, 2026 at 04:30:21 PM EDT, Tom Erdman <tom@coalitionspace.com  > wrote: \n\n \n\n \n\nHi Monaqui,\n\n \n\nWe\u2019re really glad to hear that the location continues to work well for your business and glad you're here with us. Wanted to note that we completely understand that the timing of the increase isn\u2019t ideal, especially with the details you just shared. At this time, though, the updated pricing is firm, as we do have operating and facility expenses we need to meet in order to continue maintaining the space and services for our clients.\n\n \n\nWith that in mind, the month-to-month option may be the best fit for now, since it gives you the most flexibility and may be the easiest option financially between June and September. We can always revisit closer to that time and discuss the best path forward from there.\n\n \n\nWe truly appreciate having you with us, and please feel free to reach out with any questions.\n\n \n\nBest,\n\n \n\nTom Erdman | Director of Sales, Operatio"
  },
  {
    "from": "lrloninger@comcast.net",
    "subject": "RE: Need space",
    "body": "Hi Asia, I need space once or twice a week and really only need it for an hr or two each session. \n\nThank you\nRich Loninger\nSent from my iPhone\n\n> On Jun 8, 2026, at 3:51\"\u00afPM, Asia Lopez <asia@coalitionspace.com> wrote:\n> \n> \u00ef\u00bb\u00bfHi Richard, thanks for your note! We do have space, are you working with a team, budget, or a start date? Happy to highlight some options once we receive these details!\n> \n>"
  },
  {
    "from": "Faith.Ross@InstantOffices.com",
    "subject": "RE: New  Enquiry -- Andrew Kunesh, CNN (ref 1785093)",
    "body": "Client enquiry details\n\nClient: Andrew Kunesh\nCompany: CNN\nCountry: USA\nTel: +1 6307439084\nMobile: \nEmail: andrew@kunesh.nyc\nWeb: www.cnn.com\nNo. of people: 1\nStart date: 01/06/2026\nLength of term: 12\nComments: **I have not spoken with this client, lead came in as 1ws, 12m term, start 6/1- please cc me on any communication\n\nOffices of Interest\n\n120 W 45th St, FL 21\n\nNew York City USA 10036\n(Instant Centre Ref: 118129) \n\nContact\n\nFaith Ross\nT:\nFaith.Ross@InstantOffices.com\n\nThis referral, is made subject to our standard terms and conditions. A copy of the terms and conditions can be obtained here https://u35127915.ct.sendgrid.net/ls/click?upn=u001.mZbonirh0Cx-2BY1PybC1Tjzbt2-2FvYFuvdDtTuCXQsf-2FQxpRMnInUBdcWyINdRsomKGmsDE7XKLNDdlTkNIN8xb-2Bupl3fYhPyHRKusjTzN06Y-3D9yIX_xdUTvUhIjWlSJgufBblll80gkSZKFpJZKEBfbjP72mkvGPdcqfInrtIEtjNeBH93yd4WjNRbs69WuQ9PzeV-2Bzzm2CnWwhJu0AzPd6mjXp9-2BkPJcxDtZz3Dj33xUsdQT3DAlYhNMpaOrjtGJr5zkLDROTXsAepE6WznB89FOPylApnP2d-2BEd1xOLfX7RnP68xumIWF4LDYHmO-2FghHUtKQlg-3D-3D"
  },
  {
    "from": "Laura.Todd@theinstantgroup.com",
    "subject": "RE: New  Enquiry -- Laura Todd, Confidential C/O Instant (ref 1776195)",
    "body": "Hi Asia,\n\n \n\nThank you for sending this over. Can I please get the square footage for those offices? And yes, if you also have capacity to fit them all in one space we'd love to include that option in the report for the client as well.\n\n \n\nThanks for your help!\n\n \n\nLaura\n\n________________________________"
  },
  {
    "from": "Laura.Todd@theinstantgroup.com",
    "subject": "RE: New  Enquiry -- Laura Todd, Confidential C/O Instant (ref 1776195)",
    "body": "Client enquiry details\n \nClient: Laura Todd\nCompany: Confidential C/O Instant\nCountry: USA\nTel: \nMobile: \nEmail: Laura.Todd@theinstantgroup.com  \nWeb: \nNo. of people: 40\nStart date: 08/04/2026\nLength of term: 1\nComments: THIS CUSTOMER HAS REQUESTED NOT TO RECEIVE MARKETING COMMUNICATIONS. PLEASE DO NOT ADD THEM TO YOUR MARKETING DATABASE!\n \nWe\u2019re working on a new requirement for a Confidential client for the following: \n \n\u2022 Private Office for 40 desks - 1 office preferred. 2 offices near each other will work as well.\n\u2022 Location: Midtown Manhattan, NYC\n\u2022 Term: Month to month\n\u2022 Start date: ASAP\n \nIf there are any suitable options, can you please send over floorplans, desk quantity, sq ft and pricing at your earliest convenience? If you do have any options, please let us know. \n \nThanks!\n \nOffices of Interest\n \n \n120 W 45th St, FL 21\n \n \nNew York City USA 10036\n(Instant Centre Ref: 118129) \n \n \nContact\n \nLaura Todd\nT:\nLaura.Todd@theinstantgroup.com  \n \nThis referral, is made subject to our standard terms and conditions. A copy of the terms and conditions can be obtained here https://u35127915.ct.sendgrid.net/ls/click?upn=u001.mZbonirh0Cx-2BY1PybC1Tjzbt2-2FvYFuvdDtTuCXQsf-2FQxpRMnInUBdcWyINdRsomKGmsDE7XKLNDdlTkNIN8xb-2Bupl3fYhPyHRKusjTzN06Y-3D7fiS_xdUTvUhIjWlSJgufBblll80gkSZKFpJZKEBfbjP72mmFvO8wPryf7yEWhrQ6GveXEvhftQZVRNUdnWj4cwaElzHUfpllyihFs6x6CZUyQuYwyyOh7dLtrVRa07Mbr72Ws4VkG3csHPksu7Sd-2BPhrWpQVY-2F8XXd4tnr4JUfsW3svowZS-2BgOK9kXhWSPs6Z2qKKpQtGlYpCzkctTkkV3u4xg-3D-3D\n\nThe info"
  },
  {
    "from": "notifications@calendly.com",
    "subject": "RE: New Event: leyla l souley - 10:30am Thu, May 21, 2026 - Introduction Call with Asia",
    "body": "Hi Coalition Space, \n\nA new event has been scheduled. \n\nEvent Type: \nIntroduction Call with Asia \n\nInvitee: \nleyla l souley \n\nInvitee Email: \nleylasouley7@gmail.com   \n\nEvent Date/Time: \n10:30am - Thursday, May 21, 2026 (Eastern Time - US & Canada) \n\nDescription: \n\nSchedule a quick 15-minute call with Asia to learn about our availabilities, share business developments, and go over market opportunities.\n\nLocation: \n+1 646-961-8283 \n\nInvitee Time Zone: \nEastern Time - US & Canada \n\nView event in Calendly   \n\nAdd to Google Calendar    Add to iCal/Outlook  \n\nCalendly will automatically add scheduled events if you connect your calendar   \n\n  Pro Tip!   \n\n  \n\nUse Calendly with your other tools \n\nCalendly works with the tools you already use including Zoom  , Salesforce  , Zapier   and more. See all integrations   \n\n \n\nSent from Calendly   \n\nReport this event"
  },
  {
    "from": "hit-reply@valvespace.com",
    "subject": "RE: New Referral (1643410). New York - 4-5 desks for Coalition Space by James Walton from Colliers",
    "body": "Dear Coalition Space Downtown Jersey City, \nYou have a new referral \n\n \n\nHi,\n\n \n\nWe have a client looking for a 4-5 desk private office alongside a 5-6 sqm space for a filing cabinet.\n\nStart date: June 2026\n\nPlease share the SQM of your proposed space\n\n \n\nPlease send ALL correspondence to: kalima.salam@colliers.com  \n\n \n\nMany thanks,\n\n\t\n\n \n\nAbout company\n\nNew York - 4-5 desks\n\nTerm length\n\n12 months \n\nMove-in date\n\nfrom 31/05/2026 \n\nDesks\n\n4 - 5 \n\nSpace size\n\nTBC \n\nBudget\n\nTBC \n\nRequested: Penn Station / Midtown \n\nView and approve   \n\n \n\n\t\n\nJames Walton\n\njames.walton@colliers.com  \n\nColliers\n\nVisit homepage"
  },
  {
    "from": "email@mail.commercialcafe.com",
    "subject": "RE: New lead for Coalition Space Jersey City from CoworkingMag",
    "body": "Follow-up with this new request \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u2007\u034f \u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u00ad\u200c \n\n  \n\n \n\nHi Property manager,  \n\n \n\nA new lead was generated for Coalition Space Jersey City on CoworkingMag  . To follow-up, see below your lead's details.  \n\n \n\nCoalition Space Jersey City\n\n95 Columbus Drive, Jersey City\n\n  \n\n \n\n\u200a\n\n \n\n\t\n\n \n\nName: \n\nPriya Outar\n\n \n\n\t\n\n \n\nCompany \n\nTara Law and Mediation\n\n \n\n\t\n\n \n\n\t\n\n \n\nE-mail: \n\npvoutar@gmail.com  \n\n \n\n\t\n\n \n\nPhone:\n\n6514248991\n\n \n\n\t\n\n \n\n\t\n\n \n\nRequired Workspace Type:\n\nDay Pass\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\n\t\n\n \n\nLead Notes: \n\nHi, I saw your listing for Coalition Space Jersey City on CoworkingMag and I'd like someone to get back to me with more information about your workspaces.\n\n \n\n\t\n\n \n\n \n\nGet more views for your listings across the CommercialCafe Network and  boost your leads   with Premium Listings.\n\n \n\n \n\nFor questions or support, don't hesitate to reply.\n\n \n\nRegards,\n\nThe CommercialCafe Team\n\n \n\n  \n\n \n\nManage your coworking spaces and listings and get automatic exposure on the CommercialCafe Listings Network which receives more than 2 million visits per month.\n\n \n\n \n\n\t\n\n  \n\n  \n\n\t\n\n \n\n  \n\n  \n\n  \n\n \n\n430 S Fairview Avenue\nSanta Barbara, CA 93117\nUnited States\n\n \n\nTerms of"
  },
  {
    "from": "ben@revitagency.io",
    "subject": "RE: New meeting booked (with signalco1.com)",
    "body": "Hi Team,\n\nWe have a new meeting booked for Asia!\n\n \n\nWhen: June 18th at 12 pm ET\n\n \n\nProspect info:\nName - Kevin Wortis\n\nTitle -  Founder, Head of Company\nEmail - kevin@signalco1.com  \n\nPhone - 917-607-5554\n\nCompany - https://signalco1.com\n\nOur conversation: https://share.streak.com/esDgFPe1RamIB9kKPaKEnu\n\n \n\nBest,\n\n \n\n-- \n\n  \n\nBen Tooth\nSenior SDR, Revit\n\n   ben@revitagency.io  \n\n   1309 Coffeen Ave, STE 1200 Sheridan, Wyoming 82801  \n\n\t\n\n \n\nIf you received this communication by mistake, please don't forward it to anyone else (it may contain confidential or privileged information), please erase all copies of it, including all attachments, and please let the sender know it went to the wrong person. Thanks. The above terms reflect a potential business arrangement, are provided solely as a basis for further discussion, and are not intended to be and do not constitute a legally binding obligation. No legally binding obligations will be created, implied, or inferred until an agreement in final form is executed in writing by all parties involved\n\n  \u1427\n\n  \u1427\n\nThis message may contain confidential or privileged information. If you are not the intended recipient, please delete it and notify the sender immediately. Do not copy, disclose, or distribute its contents. The information herein is for discussion purposes only and does not constitute a binding agreement. No contractual obligation exists unless set forth in a written agreement signed by all parties."
  },
  {
    "from": "wxuehsp24@gmail.com",
    "subject": "RE: Office Space Touring-Dr. Tyson Furr",
    "body": "Hi Asia,\n\nI am writing to follow up on the office tour. Could you let us know when you will be available next week? Thank you.\n\nBest regards,\nWenhui\n\nOn Wed, Jun 10, 2026 at 7:34\u202fPM Wenhui Xue <wxuehsp24@gmail.com> wrote:\n>\n> Thank you for getting back to me. Can you do Friday, 6/12 at 12:30?\n>\n> On Wed, Jun 10, 2026 at 7:29\u202fPM Asia Lopez <asia@coalitionspace.com> wrote:\n>>\n>> Hi Wenhui, great to meet you! How about this Friday, June 12th at 11am?\n>>\n>>"
  },
  {
    "from": "venusstarrw@gmail.com",
    "subject": "RE: Office space",
    "body": "Asia thank you for getting Start date would be immediate. The needed space is for 2 people plus a clothing rack and room for a large table. Many thanks! \n\nVenus\nSent from my iPhone\n\n> On Jun 2, 2026, at 5:11\"\u00afPM, Asia Lopez <asia@coalitionspace.com> wrote:\n> \n> \u00ef\u00bb\u00bfHi Venus, appreciate your note and happy to share availability! Is there a budget or start date in mind? Just want a few more details so we can highlight the best options for your client.\n> \n> Thank you!\n> \n>"
  },
  {
    "from": "mlevy@petroneassoc.com",
    "subject": "RE: Payment Completed - mlevy@petroneassoc.com",
    "body": "Hello \"\u201c I had used your space in the near Grand Central Station. I was looking to see if there is a way to book a set space for a team meeting every other month from 9:00am \"\u201c 3:00pm and how much that would cost? I do not have the set dates yet, just trying to get an idea."
  },
  {
    "from": "mlevy@petroneassoc.com",
    "subject": "RE: Payment Completed - mlevy@petroneassoc.com",
    "body": "Hello, \n\n \n\nAs per below I am renting space from you next Tuesday. I was hoping you could help me by providing some restaurants or bars that the team of 15 can grab a bit to eat around 3:00 in walking distance of the 116 West 23rd space we are using. Nothing to expensive."
  },
  {
    "from": "no-reply@openyouroffice.com",
    "subject": "RE: Payment Completed - mlevy@petroneassoc.com",
    "body": "You don't often get email from no-reply@openyouroffice.com  . Learn why this is important   \n\n\t\n\n                          \n\n \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152 \"\u0152  \n\n  \n\n  \nHi Petrone Associates \u00f0\u0178\u2018\u2039,\nPayment completed successfully for the POS mlevy@petroneassoc.com  . \n\nThe payment confirmation ID - pi_3RTnpFCoCtDE0b1P0N6fwPmN. \n\n# \n\nDetails \n\nOrganization \n\nPetrone Associates \n\nPayment Time \n\nMay 28, 2025, 1:31 p.m. \n\nLegal Entity \n\nChelsea 116 Flex Space LLC \n\nPayment Amount \n\n$240.00 \n\nFor queries reach: OYO ['aettenhofer@openyouroffice.com', 'kpowell@coalitionspace.com', 'bnagle@coalitionspace.com', 'tom@coalitionspace.com', 'remmerich@coalitionspace.com', 'jgiovanniello@coalitionspace.com']\n\n \n\nSincerely,\nOYO Team\n\n \n\nYour Friends: OYO @ Penn Station, Jersey City, Denver - USA"
  },
  {
    "from": "desk@elyvaraprivate.com",
    "subject": "RE: Private office availability conversation for MHCS AI Operations Inc.",
    "body": "Hello Coalition Space team,\n\nI'm reaching out from MHCS AI Operations Inc., a New York corporation. We are building our New York operating setup and are speaking with a few private office and flexible workspace providers.\n\nYour furnished private office and coworking options in NYC/NJ look relevant for a small operating team. Could you confirm whether you have any suitable small private office or address-rights options, and whether a short viewing or quote conversation is possible this week?\n\nThis is only an information/viewing request at this stage. I am not making a lease, deposit, broker, card payment, or binding commitment.\n\nRegards,\nFaheem\nMHCS AI Operations Inc."
  },
  {
    "from": "pierce@yourresource.com",
    "subject": "RE: Tenant interest - time-sensitive July 15 start, 12-15 desks near Grand Central",
    "body": "This is great. Thank you!\n\n \n\nOn Tue, Jun 23, 2026 at 9:40\"\u00afAM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Pierce! Highlighting options here for our Bryant Park space, happy to tour anytime this week or next."
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nquick follow up on the possible slots for the call this week (ideally today or tomorrow) and align on meeting next week at the office \n\n \n\nThanks & best regards\n\nThomas"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nthanks again! We have fully signed the contract. Looking forward working on the details with you next week and hopefully getting to know you when I am in NY from 16th to 22nd \n\n \n\nbest regards\n\nThomas"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "That would be great.\n\n \n\nIts m.heinzle@21x.eu   and u.medek@21x.eu  \n\n \n\nI already gave them a heads up :-)\n\n \n\nBest regards \n\nThomas\n\n \n\nSent from Outlook for iOS  \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Great thank you Asia.\n\nFor signing I will just forward the colleagues the contract signature mail that they can sign?\n\n \n\nThx and best regards \n\nThomas \n\n \n\nSent from Outlook for iOS  \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nI can do from 9 am (your time) onwards. Feel free to send an invite that works for you :-)\n\n \n\nCould you confirm the office 4 in the contract and send it for signature today? We are ready on our side :-)\n\n \n\nHave already a great weekend\n\nBest regards \n\nThomas\n\n \n\nSent from Outlook for iOS  \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nagain on one item I missed to add -  we would take office # 4 as per floor plan provided.\n\n \n\nBest regards \n\nThomas"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "HI Asia,\n\n \n\nthats great \u2013 thanks for sharing the updated contract. From my perspective we would be ready to sign. We have public holiday today in Austria and Germany but I will still try to get things arranged for signature.\n\n \n\nThanks for confirming that main lease is final version. We will ask terms in question from lawyers but as of latest alignment we will be ready also here as final lease was send.\n\n \n\nSo I hope we can have things signed tomorrow. Would you send it via the Open Office for signature to Max and Ulf then? If yes, you can already assign it to them and I will inform them. Please set me in CC.\n\n \n\nWe could then hopefully already discuss furniture needed and details on measures,\u2026 tomorrow \n\nWould 9 am or 10 am work for you?\n\n \n\nBest regards\n\nThomas"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Importance: High\n\n \n\nHi Asia,\n\n \n\ngreat thank you. We also have received feedback from lawyers \u2013 the basically have raised the same points as we already discussed and only few in addition. I will list all for completeness here again to be part of the contract \u2013 Please let legal make amendments and we are then ready to go \n\n \n\nAlready discussed:\n\n*\tCoalition Space Contract: \n\n\t*\tSignatories: For signatories, please change from myself to Max J. Heinzle and Ulf Medek\n\n\t*\tGeneral: Amend the address of 21X LLC to the one of the office we will rent\n\t*\tEquipment (Page 1) --> Please amend, we might use own wireless Router to have dedicated 21X wireless (as extension of wired ethernet) as well as dedicated CCTV and Access control for the Office space in scope.\n\t*\tLicensed Space and Services (Article 1) --> Ammend with Affiliates \u2013 something like \u201cLicensor grants to Licensee and Affiliates (defined as an entity that owns, is owned by, or shares a common ultimate parent with Licensee).\n\t*\tSignage (Article 14) --> we will need to place our Logo and SIPC Signage on the office (as per FINRA requirement), please amend accordingly -->\u201dLicensee shall not place or allow any signs to be placed on the Licensed Space, the Leased Premises or the Building without the prior written consent of Licensor, except as otherwise required under applicable law, including but not limited the right to display the 21X logo and SIPC signage.\u201d\n\t*\tRelocation (Article 8) --> As discussed, please extend the notice p"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nThanks a lot!\n\nHow long will it take to incorporate the changes discussed in the contract? \n\n \n\nIf you can let me know on the option for delivery of packages as mentioned below that would be great.\n\n \n\nBest regards\n\nThomas\n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia, hi Tom,\n\n \n\nlooking forward to the onsite visit tomorrow \u2013 I will try to take part as much as I can virtually \n\n \n\nWe are waiting for final feedback from our legal but if we don\u2019t get anything in addition to the already discussed amendments, I would like to ask you to get these changes done after the visit to get ready for signature.\n\n \n\nI will also be traveling to New York / New Jersey starting 17th, so maybe we can arrange a get to know then.\n\n \n\nLooking forward to finalizing everything\n\n \n\nBest regards\n\nThomas"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nThanks so much!\n\nWe will review tomorrow and will get back with any questions. we can then clear your contract with the discussed items last week and hopefully move to signing right after the visit on Tuesday.\n\n \n\nHave a great day!\n\n \n\nBest regards \n\nThomas\n\n \n\n \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nthanks for your feedback and apologies for the rush, but that\u2019s caused by the tight schedule.\n\n \n\nLooking forward to get this over the finish line \n\n \n\nBest regards\n\nThomas"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia\n\n \n\nJust a nudge If you have been able to get a response from your legal?\n\n \n\nYour Support to get this back soon is highly appreciated.\n\n \n\nBest Regards\n\nThomas\n\n \n\n \n\n \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\ni wanted to follow up on our call last week. Three items \n\n*\tMain Lease: Please share redacted master Lease\n*\tCoalition Space Lease: Please indicated if the changes proposed below are acceptable\n*\tOnsite visit: Seems there was a misalignment with me and the vendor \u2013 I did not confirm times back to you for today\u2019s visit and the vendor went onsite. Are any times available the next days for Tom being onsite?\n\n \n\nOne additional question came up on the office \u2013 I have seen some doors have glass parts \u2013 could we foil them for security purposes to reduce visibility to the office if that\u2019s applicable for the chosen office?\n\n \n\nBest regards\n\nThomas"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi Asia,\n\n \n\nThanks for letting me know - could you share Toms Number? I will forward it to the vendor.\n\n \n\nOn the note of the lease - its important to have the redacted version upfront as we will be required to respect also this according to contract.\n\nI can definitely confirm that we will sign the lease If there is not a red flag popping up (which i don\u2018t expect). \n\n \n\nWe are looking forward signing next week and start moving in.\n\n \n\nBest regards\n\nThomas \n\n \n\nSent from Outlook for iOS  \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Good Day both,\n\n \n\nHope you are well!\n\nIf you could send the main lease Today that would be great.\n\n \n\nAnother question on the onsite visit - our vendor will arrange directly with you.\n\nwho of you should they contact? Is it you, Asia?\n\n \n\nI will forward them your contact then :-)\n\n \n\nBest regards\n\nThomas\n\n \n\n \n\n________________________________"
  },
  {
    "from": "t.zraunig@21x.eu",
    "subject": "RE: Thomas Zraunig x Coalition Space (Follow-Up)",
    "body": "Hi both,\n\n \n\nthank you very much again for the efficient Call today \n\n \n\nSummarizing the discussed items:\n\n \n\n*\tMain Lease Agreement --> Please send across that we can validate\n*\tCoalition Space Contract:\n\n\t*\tGeneral: Amend the address of 21X LLC to the one of the office we will rent\n\t*\tNetwork Equipment (Page 1) --> Please amend, we might use own wireless Router to have dedicated 21X wireless (as extension of wired ethernet)\n\t*\tLicensed Space and Services (Article 1) --> Ammend with Affiliates \u2013 something like \u201cLicensor grants to Licensee and it\u2019s affiliates a license to use Licensed Space a\u2026\u201d\n\t*\tSignage (Article 14) --> we will need to place our Logo and SIPC Signage on the office (as per FINRA requirement), please amend accordingly\n\t*\tRelocation (Article 8) --> As discussed, please extend the notice period from 5 to 20 days.\n\t*\tOccupancy Tax (Article 21) --> not discussed before but I assume that one is obsolete for New Jersey office space?\n\n*\tOther Items\n\n\t*\tFurniture: lets discuss on Tuesday what would be initially in the office once we have the walkthrough (please consider the locked cabinet \u2013 at least one)\n\t*\tOffice walkthrough / physical security assessment of building:  I will send time slots once I get them and also attaching the checklist which would be walked through.\n\n \n\nThank you again and happy to get back the amended contract.\n\nLet me know if you have any questions.\n\n \n\nHave a wonderful day.\n\n \n\nBest regards\n\nThomas\n\n \n\n-----Original Appointment-----"
  },
  {
    "from": "downtownnycfoot@gmail.com",
    "subject": "RE: Tour",
    "body": "My assistant and office manager Dely will be doing the tour can 1pm work? \n\n \n\nOn Tue, Jun 23, 2026 at 8:16\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Rich! What time on Thursday works best for you?"
  },
  {
    "from": "p.meneses@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nWe have not yet received the COI from our insurer. However, as we are fully aligned on the final wording, we would suggest proceeding with the execution of the licence agreement.\n\nSubject to your agreement, I will arrange for the agreement to be routed for signature today and will provide you with the COI promptly upon receipt. In the meantime, please find attached the binding offer from Hartford (already confirmed).\n\n \n\nI look forward to your confirmation.\n\n \n\nKind regards,\n\nPedro\n\n \n\n \n\n \n\n \n\n \n\nPedro Meneses \nManager Contracts Management\n\nm:  +41 79 576 62 53\n\ne:   p.meneses@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit message"
  },
  {
    "from": "p.meneses@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Theres/Asia,\n\n \n\nWe have already reached out to our insurer and are currently waiting for their return - I believe that it will arrive within the next hours.\n\n@Asia  , I kindly ask you to provide us with the name and e-mail address of the signatory person from Coalition Space Legal Team.\n\n \n\nThank you.\n\n \n\nKind regards,\n\nPedro\n\n \n\nPedro Meneses \nManager Contracts Management\n\nm:  +41 79 576 62 53\n\ne:   p.meneses@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy\n\n________________________________"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you for the quick confirmation. @Pedro   do you need any further details to circulate the contract, once we have confirmation the COI has arrived?\n\n \n\nIn the meantime I'm also looping in my colleague @Julian  . @Julian   maybe you can follow up with Asia and the team separately to provide the details for the employee who will be using this space? @Asia   they're starting as of next week so also wondering if it will be possible for them to go as of Monday? Would be amazing.  \n\n \n\nThanks so much and best,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by c"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nIn addition to Pedro's question below, can you please confirm the identity of the signatory on behalf of Coalition? If I remember correctly it's yourself but wanted to check.\n\n \n\nOnce we have these two pieces of information we will circulate for signatures.\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "p.meneses@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you for your e-mail.\n\nCould you please confirm if you have already received the certificate of insurance issued by Hartford?\n\nMany thanks.\n\n \n\nKind regards,\n\nPedro\n\n \n\n \n\nPedro Meneses \nManager Contracts Management\n\nm:  +41 79 576 62 53\n\ne:   p.meneses@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy\n\n________________________________"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nIt will indeed be Matthias signing on behalf of MoonLake. To comply with our internal SOPs, I believe we need to be the ones circulating for signatures once everything is finalised, but again leaving this with @Pedro   \u00f0\u0178\u02dc\u0160\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nAmazing, thank you for confirming.\n\n \n\nWill hand over to @Pedro   to follow-up on the signing. Look forward to having this finalised, thank you again for all your support!\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nJust tried calling \"\u201c do you think you can get us an answer by EOD?\n\n \n\nThe alternative is that we sign our agreement without the insurance yet being in place, if that is fine with you please let us know.\n\n \n\nThanks and best,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Thank you, much appreciated!\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy\n\n________________________________"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nKindly following up on the below. Would be great to have this information asap, so we can execute on our insurance and therefore proceed to sign the contract with you as well.\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Would be great if you can also let us know\n\n*\tthe exact office (floor and room) that we will occupy\n\n \n\nThanks!"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nHope you're doing great.\n\n \n\nI have a quick question \"\u201c what is the total square feet of the private office we will have? We need this information for our insurance. I believe Pedro mentioned this already, together with some additional details we require, in the markup of the contract. Apologies if you already provided this information to us and I just missed it.\n\n \n\nBest,\n\nTheres"
  },
  {
    "from": "p.meneses@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nFurther to our previous correspondence, please find attached the reviewed and commented version of the licence agreement with Coalition in respect of the NJ office. For ease of reference, our comments have been marked as (\"@Coalition\").\n\n \n\nWe trust that the amendments reflected in the attached document are consistent with our prior discussions and aligned with the positions previously communicated. At present, we believe the only outstanding matter relates to insurance, as we are awaiting confirmation from our insurer as to whether our policy complies with the rest of the requirements set out in the agreement.\n\n \n\nWe look forward to receiving your feedback following your review and trust that this matter may now be brought to a prompt conclusion.\n\n \n\nThank you for your continued cooperation.\n\n \n\nKind regards,\n\nPedro\n\n \n\n \n\n \n\nPedro Meneses \nManager Contracts Management\n\nm:  +41 79 576 62 53\n\ne:   p.meneses@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We re"
  },
  {
    "from": "p.meneses@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you (and Tom) for your time earlier this week and for the constructive discussion. As we are in the process of concluding our internal review and in order to maintain momentum while we progress the matters discussed, we would like to confirm that we expect to provide you with our reviewed version in the course of next week.\n\n \n\nWishing you a restful weekend.\n\n \n\nKind regards,\n\nPedro\n\n \n\nPedro Meneses \nManager Contracts Management\n\nm:  +41 79 576 62 53\n\ne:   p.meneses@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/pr"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia and Tom,\n\n \n\nWe're available to speak now if works for you? Sent over an invite.\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy\n\n-----Original Appointment-----"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "When: 26 May 2026 16:50-17:00 (UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna.\nWhere: https://moonlaketx.zoom.us/j/65515901491?pwd=X2bBd9i4fb89Habivx9X32J24WDDFy.1&from=addon\n\n \n\n \n\n \n\n_____________________________________________"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nJust one more note from the below \"\u201c we'd also like to opt in for the high-speed internet, would it be ok for Pedro to insert a section on it in the contract?\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "unknown@example.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you for the call just now. Just confirming that we will then pause on the new member intake form as all the information is covered in the main contract that our legal team will share back with you shortly (just to avoid any duplication/confusion).\n\n \n\nAlready sharing our billing details below based on the form, let me know if you need any further information.\n\n \n\n \n\nThink then besides finalising the contract, all that's missing is the employee details if I'm correct?\n\n \n\nThanks so much and best,\n\nTheres"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nApologies for the delay on the new entry form. Looping in my colleague Patrycja here. We're just finalising the details and will then send over.\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com     \n\nw:   moonlaketx.com  \n\n \n\n       \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia, \n\n \n\nSuper, happy to hear and thank you for the update! \n\n \n\nOn the CDA we have one which we prefer using whenever possible, so if you could send the below I will fill in and send over to you for review (apologies maybe wasn't clear, or maybe I missed you sending it):\n\nfollowing information from you:\n\n*\tFull legal company name\n*\tCountry of registration\n*\tPlace of business\n*\tName, title, and email address of the person who will sign on behalf of Coalition space\n\n \n\nOn the IT front that's no problem, I will loop in the team.\n\n \n\nBest,\n\nTheres \n\n \n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manip"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Dear Asia,\n\n \n\nThank you again for your patience, much appreciated.\n\n \n\nWe've now had a chance to discuss this internally and we'd love to move forward with the process and lease negotiations. Also looping in Henry and Ella from JLL who are supporting us on this, who will reach out to connect with you.\n\n \n\nIn terms of other next steps, would be greatly appreciated if you can please share with us:\n\n1.\tThe proposed contractual agreement based on our aligned terms\n\n\t1.\t1-private office at NJ location\n\t2.\t3-year lease\n\t3.\t800 USD per month\n\t4.\tStart date June 1st etc.\n\n2.\tAn overview of IT set-up / any IT relevant materials (this was an ask from our IT team, for them to understand if anything is needed on their side \"\u201c very happy to loop them in directly if easier)\n\n \n\nI don't think an office tour visit is needed \"\u201c however will leave that for @Henry   and @Ella   to decide, in case they'll be in the area and wish to pop by \u00f0\u0178\u02dc\u0160\n\n \n\nAdditionally, to comply with our internal processes we will need to onboard you as a vendor. The first step is to get a CDA in place, if you have any questions on this please don't hesitate. I'm happy to send out draft CDA over to you and start the process, I would just need the following information from you:\n\n*\tFull legal company name\n*\tCountry of registration\n*\tPlace of business\n*\tName, title, and email address of the person who will sign on behalf of Industrious\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  "
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you for checking in, and Happy Spring! Weather is lovely here in Switzerland, hope same for you.\n\n \n\nWe are still finalising on our end, apologies for the delay and thank you again for your patience. We are currently also in the process for onboarding JLL as our broker in NY, so once this is completed, I will loop them and the team in as well. In the meantime looping in my colleague Roman.\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: "
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Thank you and same to you! \u00f0\u0178\u02dc\u0160\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Dear Asia,\n\n \n\nApologies for the delay in getting back to you. We're still having some final discussions on our side, I will get back to you as soon as possible!\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nApologies for the delay (was out due to Easter break over here).\n\n \n\nThank you so much for the update, much appreciated and sounds great. In terms of next steps, we have an internal call tomorrow to discuss and hopefully take a decision. Once I have this clarity I will let you know, but should hopefully be a swift process.\n\n \n\nWish you a great day ahead,\n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Thank you so much!\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Dear Asia,\n\n \n\nHope you're doing great!\n\n \n\nVery sorry to do this again, but would it be possible to please move the meeting tomorrow up by two hours to 7pm CET?\n\n \n\nBest regards,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nThank you for sending. Apologies but could we actually move it to the same time but Tuesday?\n\n \n\nAnd thank you and likewise!\n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "t.tellefsen@moonlaketx.com",
    "subject": "RE: Urgent - RE: Inquiry: Private Office Availability for MoonLake Therapeutics (New Jersey)",
    "body": "Hi Asia,\n\n \n\nYes Monday 3pm CET works, will you send the invite?\n\n \n\nBest,\n\nTheres\n\n \n\n \n\nTheres Tellefsen \nAssociate Director Corporate Strategy\n\nm:  +41 79 581 46 40\n\ne:   t.tellefsen@moonlaketx.com    \n\nw:   moonlaketx.com  \n\n \n\nMoonlake Immunotherapeutics AG, Dorfstrasse 29, 6300 Zug, Switzerland\n\n\t\n\nConfidentiality Notice\n\nAny information contained in this e-mail (and any attachments) is intended exclusively for the addressee(s) and may contain confidential and/or privileged information. Any disclosure, reproduction, dissemination, distribution or use by a party other than the addressee(s) is strictly prohibited.\n\nIf you are not the intended recipient, please notify the sender as soon as possible and delete any copies. We reject any liability for the improper, incomplete or delayed transmission of the information contained in this message, as well as for damages resulting from this e-mail message. We cannot guarantee that the message received by you has not been intercepted by third parties and/or manipulated by computer programs used to transmit messages and viruses.\n\nPrivacy policy\nPlease find our privacy policy on our website: https://www.moonlaketx.com/privacy"
  },
  {
    "from": "nancy@thebizopia.top",
    "subject": "RE: Weinreb Elliot Attorney NYC Office Spaces",
    "body": "Hi Weinreb Elliot Attorney Team,\n\nI think your flexible NYC office spaces, starting at $495, solve a key pain point for professionals needing affordable, prime locations.\n\nWhen AI search tools bypass your website to answer prospect questions about Manhattan office space, our AEO service ensures your flexible, furnished solutions are the cited source that drives qualified leads directly to you.\n\nA client grew revenue 4x and expanded from 9 to 27 employees over our partnership.\n\nOpen to prepare a short look at how Weinreb Elliot Attorney is currently being surfaced in AI search.\n\nInterested?\n\nThanks\nNancy Lee - Bizopia\n\nIf this is better suited for someone else, feel free to share this with them or point me in the right direction.\n\nThanks for taking the time to read this email. I thought this might be relevant to Weinreb Elliot Attorney, so I wanted to reach out. If it's not the right timing, just send me a quick note and I'll leave you be.\n\n-----------------------------------------------------------------------------\nThank you for reviewing this message. This message is part of a continuing exchange with you, and I'd like to take a moment to ensure you have clear information about why you received this email, how your information is handled, and what to expect from future messages.\n\nWhy You're Receiving This Email: You're receiving this email because, at an earlier time, you requested messages on a particular subject we talked about before. Whether it was through a subscriptio"
  },
  {
    "from": "marisol@officenetworkglobal.com",
    "subject": "RE: **URGENT REQUEST** NEW CLIENT REFERRAL FROM OFFICENETWORK FOR NYC",
    "body": "Hi Asia, \n\n \n\nWe just received feedback from Jana after the tour. For now, they are not considering this location, but I will let you know if anything changes.\n\n \n\nThank you so much for your proposal and assistance.\n\n \n\nBest regards,\n\n____________________________________________ \n\nMarisol Cianchini \n\nGlobal Account Specialist \n\nwww.officenetworkglobal.com  \n\n530 Ave. de la Constituci\u00c3\u00b3n\n\nSan Juan, PR 00917 \n\n \n\n \n\n \n\n \n\nOn Fri, Apr 17, 2026 at 4:58\"\u00afPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tYes, proposal is the same."
  },
  {
    "from": "virginia@pureproduction.com",
    "subject": "RE: a day in Grand Central",
    "body": "We will need Monday, March 23 from 11AM \u2013 4PM \u2026.so that will be $150.  Payable to?"
  },
  {
    "from": "virginia@pureproduction.com",
    "subject": "RE: a day in Grand Central",
    "body": "Hi Asia\n\n \n\nScott and I would like to rent a room at 485 Madison Avenue location again this coming Monday, March 23 from 11AM-4PM.\n\n \n\nPlease let me know if you have availability and next  steps.\n\n \n\nThank you\n\nVirginia\n\n \n\n \n\n\tFrom: Asia Lopez <asia@coalitionspace.com  >\n\tDate: March 11, 2026 at 2:32:42\u202fPM EDT\n\tTo: Virginia Kornfeld <virginia@pureproduction.com  >\n\tCc: Dianne Irizarry <dirizarry@coalitionspace.com  >\n\tSubject: RE: a day in Grand Central\n\n\t\ufeff \n\n\tExcellent! I\u2019m cc\u2019ing our Madison Avenue manager, Dianne, here as she\u2019ll add you to the security list and accommodate your team for next Monday"
  },
  {
    "from": "kathy.d@voassoc.com",
    "subject": "RE: address setup for AIVO",
    "body": "---------- Forwarded message ---------"
  },
  {
    "from": "sebastian@tryaivo.com",
    "subject": "RE: address setup for AIVO",
    "body": "Hey Kathy,\n\nSounds interesting. What are the details on the NYC Virtual Office?\n\n \n\nOn Wed, Mar 11, 2026 at 11:41\u202fAM Kathy Donohue <kathy.d@voassoc.com  > wrote:\n\n\tHi Sebastian,\n\t\n\tIf you could set up a NYC Virtual Office that strengthens your brand image with a prime address and gives you a convenient landing pad when traveling to NYC, would that be worth a quick conversation?\n\t\n\tBest,\n\t\n\t--\n\tKathy Donohue\n\tPresident of the Virtual Office Association (VOA)\n\n  \u1427"
  },
  {
    "from": "nate@leadsquad.com",
    "subject": "RE: address setup for Buyer Found",
    "body": "Tell me more.\n\n \n\nNate \n\n \n\nOn Wed, Apr 15, 2026 at 8:51\u202fAM Kathy Donohue <kathy.donohue@voassoc.com  > wrote:\n\n\tHey Nathan,\n\t\n\tIf Buyer Found could have a NYC virtual office with a prime Manhattan address for your brand, with all the benefits of a real office without needing to lease one, would that be worth exploring?\n\t\n\tBest regards,\n\t\n\t--\n\tKathy Donohue\n\tPresident of the Virtual Office Association (VOA)\n\nLeadSquad | leadsquad.com   | Davis Islands, FL\nThis message and any attachments are confidential and intended solely for the named addressee. If you have received this email in error, please notify the sender immediately and permanently delete this message. Unauthorized use, disclosure, or copying is strictly prohibited.\n\n  \u1427"
  },
  {
    "from": "bassal.m@dakia.ai",
    "subject": "RE: address setup for Dakia.ai",
    "body": "yes\n\n------------------------------\nBassal Malik\nFounder & CEO - Dakia.ai  \n\n522 W RIVERSIDE AVE\n\nSpokane, WA 99201.\n\n \n\n\tOn 06-Apr-2026, at 9:38\u202fPM, Kathy Donohue <kathy.donohue@voassoc.com  > wrote:\n\n\t \n\n\tHi Bassal,\n\t\n\tIf you could get a NYC Virtual Office that enhances your company credibility with a prime address and offers you a reliable home base when traveling to NYC, would it make sense to explore?\n\t\n\tBest,\n\t\n\t--\n\tKathy Donohue\n\tPresident of the Virtual Office Association (VOA)\n\n \n\n  \u1427"
  },
  {
    "from": "fernanda@f3digitalmarketing.com",
    "subject": "RE: address setup for F3 Digital Marketing",
    "body": "Hey Kathy,\n\nI'm curious for future \n\nThanks\n\n \n\nOn Wed, Mar 4, 2026 at 12:29\u202fPM Kathy Donohue <kathy.donohue@voassoc.com  > wrote:\n\n\tHello Fernanda,\n\t\n\tIf you could secure a NYC Virtual Office that enhances your company credibility with a prime address and offers you a reliable home base when traveling to NYC, would that be worth a quick conversation?\n\t\n\tBest regards,\n\t\n\t--\n\tKathy Donohue\n\tPresident of the Virtual Office Association (VOA)\n\n \n\n-- \n\nBest,\n\nFernanda Ferrari\nFounder | F3 Digital Marketing\n Email: fernanda@f3digitalmarketing.com  \n Website: www.f3digitalmarketing.com  \n Phone: 203-581-3061\n Based in Bridgeport, CT\n\nStrategy | Growth | Results\nCustomized digital marketing solutions for long-term business success.\n\n Connect with us:\nLinkedIn   | Instagram   | Facebook"
  },
  {
    "from": "kconnors@squidxmedia.com",
    "subject": "RE: address setup for Squid X Media",
    "body": "No problem. A one-pager works to start. Thanks! \n\n \n\nOn Mon, Mar 16, 2026 at 4:15\u202fPM Asia Lopez <asia@coalitionspace.com  > wrote:\n\n\tHi Kristina! Apologies it picked up at the office, just tried giving you a call from (212) 624-9200. If it\u2019s easier, I can share a one-pager here too, LMK!"
  },
  {
    "from": "alex.valadzko@jaydevs.com",
    "subject": "RE: note on NYC address",
    "body": "Hi Asia, \n\n \n\nThank you for the email. Couple questions \n\nWhat is the monthly cost for this service?\nCan this address be used for formal US company registration?\nDoes it function as a standard office address, and is it marketed or listed specifically as a virtual office?\n\n \n\nThanks\n\n \n\nOn Fri, May 22, 2026 at 2:58\u202fPM Asia Lopez <asia@coalitionspace.net  > wrote:\n\n\tHi Alex,\n\t\n\tto provide a bit more context, when companies from Lithuania set up a virtual office with Coalition Space, it generally includes:\n\t\n\t- A professional NYC business address within a real office building\n\t- Mail handling and forwarding, with pickup or forwarding as needed\n\t- A compliant commercial address that supports US facing needs like client onboarding, vendors, and banks or payment processors\n\t\n\tThis is meant to give teams like JayDevs a credible NYC presence in the US without committing to a full office lease.\n\t\n\tWould it help to talk through whether this fits what you need right now?\n\t\n\tThanks,\n\t\n\t\n\t--\n\tAsia Lopez\n\tCommunity Manager\n\tCoalition Space\n\n  \u1427"
  },
  {
    "from": "DLati@Ksrny.com",
    "subject": "Re: 462 7th Ave Sublease",
    "body": "Its will be the easy part trust me just send some few picture of turnkey available space that I can send it to them first \n\nBest,\n\nDvir Lati   \n\nE: Dlati@ksrny.com   | M: 347-891-7629\n1385 Broadway, 22nd Floor\n\nNew York, NY 10018\n\nwww.ksrny.com"
  },
  {
    "from": "DLati@Ksrny.com",
    "subject": "Re: 462 7th Ave Sublease",
    "body": "He's looking for around 800\"\u201c1,000 SF.\n\nI'm sending him a few options to get his attention he needs to sign a lease by the end of the month.\n\nThe budget is around $3K\"\u201c$4K/month, so anything within that range would be well received.\n\n \n\nBest,\n\nDvir Lati   \n\nE: Dlati@ksrny.com   | M: 347-891-7629\n1385 Broadway, 22nd Floor\n\nNew York, NY 10018\n\nwww.ksrny.com"
  },
  {
    "from": "DLati@Ksrny.com",
    "subject": "Re: 462 7th Ave Sublease",
    "body": "Yes, what is the SF? Price? one year deal can work?\n\nSend my flyer or pictures if you have them\n\n \n\nBest,\n\nDvir Lati   \n\nE: Dlati@ksrny.com   | M: 347-891-7629\n1385 Broadway, 22nd Floor\n\nNew York, NY 10018\n\nwww.ksrny.com"
  },
  {
    "from": "DLati@Ksrny.com",
    "subject": "Re: 462 7th Ave Sublease",
    "body": "Good morning Tom.\n\nDid you had a chance to see my email?\n\n \n\nBest,\n\nDvir Lati   \n\nE: Dlati@ksrny.com   | M: 347-891-7629\n1385 Broadway, 22nd Floor\n\nNew York, NY 10018\n\nwww.ksrny.com  \n\n \n\n________________________________"
  },
  {
    "from": "unknown@example.com",
    "subject": "Re: 462 7th Ave Sublease",
    "body": "Hi Tom,\nI'm working with a 4\"\u201c6 person startup looking for sublease.\n\nCould you please share the size you have that would fit that number of people, along with the asking rent and where a deal could realistically land?\n\nThey ready to move asap\n\n \n\nBest,\n\nDvir Lati   \n\nE: Dlati@ksrny.com   | M: 347-891-7629\n1385 Broadway, 22nd Floor\n\nNew York, NY 10018\n\nwww.ksrny.com"
  }
];

const SPAM_EXAMPLES = [
  {
    "from": "noreply@seoblast.biz",
    "subject": "Rank #1 on Google GUARANTEED",
    "body": "Dear Business Owner, Our proven SEO system will get your website to the top of Google. Limited time offer 50% off. Click here to claim your free audit. Unsubscribe anytime."
  },
  {
    "from": "priya.raman@gmail.com",
    "subject": "Application for Community Manager position",
    "body": "Dear Hiring Team, I am writing to apply for the Community Manager role. I have five years of experience in hospitality. My resume is attached. Thank you, Priya"
  },
  {
    "from": "sales@officesupplydirect.net",
    "subject": "Bulk pricing on desks and chairs",
    "body": "Hello, We supply ergonomic office furniture to coworking operators nationwide. Would you be interested in a quote for bulk desks and chairs? We can beat any competitor pricing. Regards, Dan"
  },
  {
    "from": "crypto@investnow.io",
    "subject": "Turn $500 into $50000 with AI trading",
    "body": "Our AI trading bot generates guaranteed returns. Join thousands of investors already profiting. Limited spots available. Sign up now before this opportunity closes forever."
  },
  {
    "from": "newsletter@marketingweekly.com",
    "subject": "This weeks top marketing tips",
    "body": "Hi there, Check out our latest newsletter packed with marketing insights, growth hacks, and industry news. Click to read more. Manage your subscription preferences here."
  }
];

const ALL = [...REAL_INQUIRIES, ...SPAM_EXAMPLES];

async function main() {
  console.log(`Seeding ${ALL.length} emails (${REAL_INQUIRIES.length} real + ${SPAM_EXAMPLES.length} spam)\n`);

  let stored = 0, skipped = 0, failed = 0;

  for (const email of ALL) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...email,
          messageId: `seed-${email.from}-${email.subject}`.slice(0, 120),
        }),
      });
      const data = await res.json();
      if (data.duplicate) { skipped++; }
      else if (res.ok) { stored++; process.stdout.write("."); }
      else { failed++; console.log(`\n  fail: ${email.subject} - ${data.error}`); }
    } catch (err) {
      console.log(`\n  error: is the dev server running? ${err.message}`);
      return;
    }
  }

  console.log(`\n\nDone. Stored: ${stored}, Skipped (dupes): ${skipped}, Failed: ${failed}`);
  console.log(`Open http://localhost:3000/inbox`);
}

main();
