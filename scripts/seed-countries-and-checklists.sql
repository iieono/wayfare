-- First, insert countries data
INSERT INTO countries (code, name, flag_url, region, official_languages, risk_score) VALUES
('US', 'United States', 'https://flagcdn.com/us.svg', 'North America', ARRAY['English'], 1),
('GB', 'United Kingdom', 'https://flagcdn.com/gb.svg', 'Europe', ARRAY['English'], 1),
('FR', 'France', 'https://flagcdn.com/fr.svg', 'Europe', ARRAY['French'], 1),
('DE', 'Germany', 'https://flagcdn.com/de.svg', 'Europe', ARRAY['German'], 1),
('JP', 'Japan', 'https://flagcdn.com/jp.svg', 'Asia', ARRAY['Japanese'], 1),
('AU', 'Australia', 'https://flagcdn.com/au.svg', 'Oceania', ARRAY['English'], 1),
('CA', 'Canada', 'https://flagcdn.com/ca.svg', 'North America', ARRAY['English', 'French'], 1),
('IT', 'Italy', 'https://flagcdn.com/it.svg', 'Europe', ARRAY['Italian'], 1),
('ES', 'Spain', 'https://flagcdn.com/es.svg', 'Europe', ARRAY['Spanish'], 1),
('NL', 'Netherlands', 'https://flagcdn.com/nl.svg', 'Europe', ARRAY['Dutch'], 1),
('CH', 'Switzerland', 'https://flagcdn.com/ch.svg', 'Europe', ARRAY['German', 'French', 'Italian'], 1),
('SE', 'Sweden', 'https://flagcdn.com/se.svg', 'Europe', ARRAY['Swedish'], 1),
('NO', 'Norway', 'https://flagcdn.com/no.svg', 'Europe', ARRAY['Norwegian'], 1),
('DK', 'Denmark', 'https://flagcdn.com/dk.svg', 'Europe', ARRAY['Danish'], 1),
('SG', 'Singapore', 'https://flagcdn.com/sg.svg', 'Asia', ARRAY['English', 'Malay', 'Mandarin', 'Tamil'], 1),
('KR', 'South Korea', 'https://flagcdn.com/kr.svg', 'Asia', ARRAY['Korean'], 1),
('NZ', 'New Zealand', 'https://flagcdn.com/nz.svg', 'Oceania', ARRAY['English'], 1),
('AT', 'Austria', 'https://flagcdn.com/at.svg', 'Europe', ARRAY['German'], 1),
('BE', 'Belgium', 'https://flagcdn.com/be.svg', 'Europe', ARRAY['Dutch', 'French', 'German'], 1),
('FI', 'Finland', 'https://flagcdn.com/fi.svg', 'Europe', ARRAY['Finnish', 'Swedish'], 1),
('CN', 'China', 'https://flagcdn.com/cn.svg', 'Asia', ARRAY['Mandarin'], 2),
('IN', 'India', 'https://flagcdn.com/in.svg', 'Asia', ARRAY['Hindi', 'English'], 2),
('TH', 'Thailand', 'https://flagcdn.com/th.svg', 'Asia', ARRAY['Thai'], 2),
('VN', 'Vietnam', 'https://flagcdn.com/vn.svg', 'Asia', ARRAY['Vietnamese'], 2),
('MY', 'Malaysia', 'https://flagcdn.com/my.svg', 'Asia', ARRAY['Malay'], 2),
('ID', 'Indonesia', 'https://flagcdn.com/id.svg', 'Asia', ARRAY['Indonesian'], 2),
('PH', 'Philippines', 'https://flagcdn.com/ph.svg', 'Asia', ARRAY['Filipino', 'English'], 2),
('MX', 'Mexico', 'https://flagcdn.com/mx.svg', 'North America', ARRAY['Spanish'], 2),
('BR', 'Brazil', 'https://flagcdn.com/br.svg', 'South America', ARRAY['Portuguese'], 2),
('AR', 'Argentina', 'https://flagcdn.com/ar.svg', 'South America', ARRAY['Spanish'], 2),
('CL', 'Chile', 'https://flagcdn.com/cl.svg', 'South America', ARRAY['Spanish'], 2),
('PE', 'Peru', 'https://flagcdn.com/pe.svg', 'South America', ARRAY['Spanish'], 2),
('CO', 'Colombia', 'https://flagcdn.com/co.svg', 'South America', ARRAY['Spanish'], 2),
('ZA', 'South Africa', 'https://flagcdn.com/za.svg', 'Africa', ARRAY['Afrikaans', 'English'], 2),
('MA', 'Morocco', 'https://flagcdn.com/ma.svg', 'Africa', ARRAY['Arabic', 'Berber'], 2),
('EG', 'Egypt', 'https://flagcdn.com/eg.svg', 'Africa', ARRAY['Arabic'], 2),
('KE', 'Kenya', 'https://flagcdn.com/ke.svg', 'Africa', ARRAY['English', 'Swahili'], 2),
('TZ', 'Tanzania', 'https://flagcdn.com/tz.svg', 'Africa', ARRAY['English', 'Swahili'], 2),
('TR', 'Turkey', 'https://flagcdn.com/tr.svg', 'Asia/Europe', ARRAY['Turkish'], 2),
('RU', 'Russia', 'https://flagcdn.com/ru.svg', 'Europe/Asia', ARRAY['Russian'], 3);

-- Now insert checklist data for each country and user type
-- United States - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'US'), 'tourist', 
'{"documents": ["Valid passport", "ESTA authorization or B-2 visa", "Return flight ticket", "Proof of accommodation"], "health": ["Travel insurance", "Prescription medications in original containers"], "customs": ["Customs declaration form"], "financial": ["Credit cards", "Cash (USD)", "Bank statements if requested"]}',
'{"prohibited": ["Fresh fruits and vegetables", "Meat products", "Cuban cigars", "Kinder Surprise eggs"], "restricted": ["Alcohol (max 1L duty-free)", "Tobacco (max 200 cigarettes)", "Gifts over $100"]}',
'{"step1": "Apply for ESTA at least 72 hours before travel", "step2": "Check passport validity (must be valid for duration of stay)", "step3": "Book accommodation and print confirmations", "step4": "Notify banks of travel plans", "step5": "Pack medications in carry-on with prescriptions"}',
'{"esta": "https://esta.cbp.dhs.gov/", "customs": "https://www.cbp.gov/travel", "embassy": "https://travel.state.gov/"}',
true);

-- United States - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'US'), 'student', 
'{"documents": ["Valid passport", "F-1/J-1/M-1 student visa", "I-20 or DS-2019 form", "SEVIS fee receipt", "Acceptance letter from school", "Financial support documents"], "health": ["Immunization records", "Health insurance", "Medical prescriptions"], "academic": ["Transcripts", "Test scores (TOEFL/IELTS)", "Diploma certificates"]}',
'{"prohibited": ["Fresh fruits and vegetables", "Meat products", "Pirated materials"], "restricted": ["Large amounts of cash (declare over $10,000)", "Academic materials from certain countries"]}',
'{"step1": "Obtain student visa and pay SEVIS fee", "step2": "Complete medical examinations if required", "step3": "Arrange housing through school or independently", "step4": "Open US bank account after arrival", "step5": "Register for classes and orientation"}',
'{"sevis": "https://www.fmjfee.com/", "visa": "https://travel.state.gov/content/travel/en/us-visas/study.html", "ice": "https://www.ice.gov/sevis"}',
true);

-- United Kingdom - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'GB'), 'tourist', 
'{"documents": ["Valid passport", "Visitor visa (if required)", "Return flight ticket", "Proof of accommodation", "Travel itinerary"], "health": ["Travel insurance", "EHIC/GHIC (for EU citizens)", "Prescription medications"], "financial": ["Credit/debit cards", "Cash (GBP)", "Bank statements"]}',
'{"prohibited": ["Offensive weapons", "Controlled drugs", "Indecent materials", "Counterfeit goods"], "restricted": ["Alcohol (max 4L wine, 1L spirits)", "Tobacco (max 200 cigarettes)", "Cash over £10,000"]}',
'{"step1": "Check if visa required based on nationality", "step2": "Book accommodation and transport", "step3": "Get travel insurance", "step4": "Exchange currency or notify bank", "step5": "Download offline maps and transport apps"}',
'{"visa": "https://www.gov.uk/check-uk-visa", "customs": "https://www.gov.uk/duty-free-goods", "nhs": "https://www.nhs.uk/using-the-nhs/healthcare-for-visitors-to-england/"}',
true);

-- United Kingdom - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'GB'), 'student', 
'{"documents": ["Valid passport", "Student visa (Tier 4/Student route)", "CAS (Confirmation of Acceptance for Studies)", "Academic qualifications", "English language certificates", "Financial evidence", "TB test results (if required)"], "health": ["NHS surcharge payment", "Medical records", "Prescription medications"], "academic": ["University acceptance letter", "Transcripts", "IELTS/TOEFL scores"]}',
'{"prohibited": ["Illegal drugs", "Offensive weapons", "Hate materials"], "restricted": ["Large electronics (may require customs declaration)", "Academic materials from restricted countries"]}',
'{"step1": "Apply for student visa with CAS number", "step2": "Pay NHS surcharge", "step3": "Complete TB test if from high-risk country", "step4": "Arrange university accommodation", "step5": "Set up UK bank account after arrival"}',
'{"visa": "https://www.gov.uk/student-visa", "cas": "https://www.gov.uk/confirm-acceptance-study-uk", "nhs": "https://www.gov.uk/healthcare-immigration-application"}',
true);

-- France - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'FR'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance (minimum €30,000)", "Proof of accommodation", "Return flight ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (EUR)", "Bank statements if requested"]}',
'{"prohibited": ["Weapons", "Drugs", "Counterfeit goods", "Endangered species products"], "restricted": ["Alcohol (personal use only)", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Get comprehensive travel insurance", "step3": "Book accommodation in advance", "step4": "Learn basic French phrases", "step5": "Download transport apps (SNCF, RATP)"}',
'{"visa": "https://france-visas.gouv.fr/", "customs": "https://www.douane.gouv.fr/", "tourism": "https://www.france.fr/en"}',
true);

-- France - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'FR'), 'student', 
'{"documents": ["Valid passport", "Student visa (VLS-TS)", "Campus France approval", "University acceptance letter", "Academic transcripts", "French language certificates", "Financial proof"], "health": ["Health insurance", "Medical certificate", "Vaccination records"], "academic": ["Diploma translations", "Academic records", "Language test scores"]}',
'{"prohibited": ["Illegal substances", "Weapons", "Pirated academic materials"], "restricted": ["Large amounts of cash", "Professional equipment (may need declaration)"]}',
'{"step1": "Apply through Campus France", "step2": "Obtain long-stay student visa", "step3": "Find accommodation (CROUS or private)", "step4": "Open French bank account", "step5": "Register with local prefecture after arrival"}',
'{"campus_france": "https://www.campusfrance.org/", "visa": "https://france-visas.gouv.fr/", "crous": "https://www.crous-paris.fr/"}',
true);

-- Germany - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'DE'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Hotel reservations", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications with German translations"], "financial": ["Credit cards", "Cash (EUR)", "Bank statements"]}',
'{"prohibited": ["Nazi memorabilia", "Weapons", "Drugs", "Counterfeit goods"], "restricted": ["Alcohol for personal use", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check visa requirements for Schengen area", "step2": "Get travel insurance with medical coverage", "step3": "Book accommodation and transport", "step4": "Learn basic German phrases", "step5": "Download DB Navigator app for trains"}',
'{"visa": "https://www.germany.travel/en/ms/german-visa/german-visa.html", "customs": "https://www.zoll.de/EN/", "tourism": "https://www.germany.travel/en"}',
true);

-- Germany - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'DE'), 'student', 
'{"documents": ["Valid passport", "Student visa or residence permit", "University admission letter", "Academic certificates", "German language certificate", "Financial proof (€11,208/year)", "Health insurance"], "health": ["Health insurance certificate", "Medical records", "Vaccination certificate"], "academic": ["Translated diplomas", "Academic transcripts", "Language certificates (DSH/TestDaF)"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Nazi symbols"], "restricted": ["Large electronics", "Academic equipment"]}',
'{"step1": "Apply for student visa with university admission", "step2": "Prove financial resources (blocked account)", "step3": "Get health insurance", "step4": "Find student accommodation", "step5": "Register address (Anmeldung) within 14 days"}',
'{"visa": "https://www.make-it-in-germany.com/en/study-training/study/", "daad": "https://www.daad.de/en/", "insurance": "https://www.krankenkassen.de/"}',
true);

-- Japan - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'JP'), 'tourist', 
'{"documents": ["Valid passport", "Tourist visa (if required)", "Return flight ticket", "Hotel reservations", "Travel itinerary"], "health": ["Travel insurance", "Prescription medications with Japanese translations", "Medical certificate for controlled substances"], "financial": ["Cash (JPY - Japan is cash-heavy)", "Credit cards", "IC card for transport"]}',
'{"prohibited": ["Narcotics", "Firearms", "Pornographic materials", "Counterfeit goods", "Fresh fruits/vegetables"], "restricted": ["Prescription drugs (require permit)", "Alcohol (max 3 bottles)", "Tobacco (max 400 cigarettes)"]}',
'{"step1": "Check visa requirements (many countries visa-free)", "step2": "Get cash in yen (many places don't accept cards)", "step3": "Download translation apps", "step4": "Book JR Pass if traveling extensively", "step5": "Learn basic Japanese etiquette"}',
'{"visa": "https://www.mofa.go.jp/j_info/visit/visa/", "customs": "https://www.customs.go.jp/english/", "jnto": "https://www.japan.travel/en/"}',
true);

-- Japan - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'JP'), 'student', 
'{"documents": ["Valid passport", "Student visa (ryugaku)", "Certificate of Eligibility", "University acceptance letter", "Academic transcripts", "Japanese language certificates", "Financial proof"], "health": ["Health certificate", "Vaccination records", "National Health Insurance enrollment"], "academic": ["Diploma certificates", "Academic records", "JLPT certificates"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Subversive materials"], "restricted": ["Large amounts of cash", "Academic equipment", "Prescription medications"]}',
'{"step1": "Obtain Certificate of Eligibility from Japanese school", "step2": "Apply for student visa at Japanese consulate", "step3": "Arrange accommodation through school", "step4": "Enroll in National Health Insurance after arrival", "step5": "Register at city hall within 14 days"}',
'{"visa": "https://www.studyinjapan.go.jp/en/", "coe": "https://www.isa.go.jp/en/", "jasso": "https://www.jasso.go.jp/en/"}',
true);

-- Australia - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'AU'), 'tourist', 
'{"documents": ["Valid passport", "ETA or eVisitor visa", "Return flight ticket", "Proof of funds", "Travel itinerary"], "health": ["Travel insurance", "Prescription medications", "Medical certificates for conditions"], "financial": ["Credit cards", "Cash (AUD)", "Bank statements"]}',
'{"prohibited": ["Drugs", "Weapons", "Fresh food", "Wooden items", "Soil/sand"], "restricted": ["Alcohol (max 2.25L)", "Tobacco (max 25g)", "Gifts over AUD 900", "Cash over AUD 10,000"]}',
'{"step1": "Apply for ETA or eVisitor visa online", "step2": "Get comprehensive travel insurance", "step3": "Declare all food, plant, and animal products", "step4": "Book accommodation and transport", "step5": "Check biosecurity requirements"}',
'{"visa": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601", "customs": "https://www.abf.gov.au/", "tourism": "https://www.australia.com/"}',
true);

-- Australia - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'AU'), 'student', 
'{"documents": ["Valid passport", "Student visa (subclass 500)", "CoE (Confirmation of Enrolment)", "OSHC (health insurance)", "Academic qualifications", "English test results", "Financial evidence"], "health": ["OSHC policy", "Medical examination results", "Health records"], "academic": ["University acceptance", "Academic transcripts", "IELTS/TOEFL scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Biosecurity risks"], "restricted": ["Large electronics", "Academic materials", "Prescription drugs"]}',
'{"step1": "Receive CoE from Australian institution", "step2": "Apply for student visa online", "step3": "Get OSHC health insurance", "step4": "Complete health examinations if required", "step5": "Arrange accommodation and airport pickup"}',
'{"visa": "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", "oshc": "https://www.privatehealth.gov.au/health_insurance/overseas/", "study": "https://www.studyinaustralia.gov.au/"}',
true);

-- Canada - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CA'), 'tourist', 
'{"documents": ["Valid passport", "eTA or visitor visa", "Return flight ticket", "Proof of funds", "Travel itinerary"], "health": ["Travel insurance", "Prescription medications", "Medical documents"], "financial": ["Credit cards", "Cash (CAD)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Hate propaganda", "Child pornography"], "restricted": ["Alcohol (varies by province)", "Tobacco (max 200 cigarettes)", "Cash over CAD 10,000", "Food items"]}',
'{"step1": "Apply for eTA (for visa-exempt countries)", "step2": "Get travel health insurance", "step3": "Book accommodation and transport", "step4": "Check provincial alcohol limits", "step5": "Download ArriveCAN app if required"}',
'{"eta": "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html", "customs": "https://www.cbsa-asfc.gc.ca/", "tourism": "https://www.canada.travel/"}',
true);

-- Canada - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CA'), 'student', 
'{"documents": ["Valid passport", "Study permit", "Letter of acceptance", "Provincial Attestation Letter (PAL)", "Financial proof", "Language test results"], "health": ["Medical exam results", "Health insurance", "Vaccination records"], "academic": ["Academic transcripts", "Diplomas", "Language certificates"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Hate materials"], "restricted": ["Large amounts of cash", "Academic equipment", "Prescription medications"]}',
'{"step1": "Get Provincial Attestation Letter (PAL)", "step2": "Apply for study permit with acceptance letter", "step3": "Complete medical exam if required", "step4": "Arrange accommodation", "step5": "Apply for SIN after arrival"}',
'{"study_permit": "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", "pal": "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents.html", "cic": "https://www.cic.gc.ca/"}',
true);

-- Italy - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'IT'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Hotel bookings", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (EUR)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Counterfeit goods", "Cultural artifacts"], "restricted": ["Alcohol for personal use", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Book accommodation in advance (especially Rome/Florence)", "step3": "Get travel insurance", "step4": "Learn basic Italian phrases", "step5": "Book museum tickets online in advance"}',
'{"visa": "https://vistoperitalia.esteri.it/", "tourism": "https://www.italia.it/en", "museums": "https://www.beniculturali.it/"}',
true);

-- Italy - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'IT'), 'student', 
'{"documents": ["Valid passport", "Student visa", "University acceptance letter", "Academic qualifications", "Italian language certificate", "Financial proof", "Declaration of value"], "health": ["Health insurance", "Medical certificate", "Vaccination records"], "academic": ["Diploma translations", "Academic transcripts", "Language certificates"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Pirated materials"], "restricted": ["Large electronics", "Academic equipment"]}',
'{"step1": "Get Declaration of Value from Italian consulate", "step2": "Apply for student visa", "step3": "Find accommodation (university or private)", "step4": "Get health insurance", "step5": "Apply for residence permit (permesso di soggiorno) after arrival"}',
'{"visa": "https://vistoperitalia.esteri.it/", "study": "https://www.universitaly.it/", "permesso": "https://www.poliziadistato.it/"}',
true);

-- Spain - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'ES'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Accommodation proof", "Return flight"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (EUR)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Counterfeit items", "Endangered species"], "restricted": ["Alcohol for personal use", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Get comprehensive travel insurance", "step3": "Book accommodation", "step4": "Learn basic Spanish phrases", "step5": "Download transport apps (Renfe, Metro)"}',
'{"visa": "http://www.exteriores.gob.es/Portal/en/", "tourism": "https://www.spain.info/en/", "renfe": "https://www.renfe.com/"}',
true);

-- Spain - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'ES'), 'student', 
'{"documents": ["Valid passport", "Student visa", "University acceptance", "Academic credentials", "Spanish language certificate", "Financial proof", "Criminal background check"], "health": ["Health insurance", "Medical certificate", "Vaccination records"], "academic": ["Apostilled diplomas", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal substances", "Weapons", "Hate materials"], "restricted": ["Large amounts of cash", "Professional equipment"]}',
'{"step1": "Get documents apostilled in home country", "step2": "Apply for student visa", "step3": "Find accommodation", "step4": "Get health insurance", "step5": "Apply for NIE (foreigner ID) after arrival"}',
'{"visa": "http://www.exteriores.gob.es/Portal/en/", "study": "https://www.educacionyfp.gob.es/", "nie": "https://www.policia.es/"}',
true);

-- Netherlands - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NL'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Hotel reservations", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (EUR)", "Bank statements"]}',
'{"prohibited": ["Hard drugs", "Weapons", "Fireworks", "Counterfeit goods"], "restricted": ["Soft drugs (coffee shops only)", "Alcohol for personal use", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Book accommodation (especially in Amsterdam)", "step3": "Get travel insurance", "step4": "Download NS app for trains", "step5": "Get OV-chipkaart for public transport"}',
'{"visa": "https://www.government.nl/topics/visa-for-the-netherlands", "tourism": "https://www.holland.com/", "transport": "https://www.ns.nl/en"}',
true);

-- Netherlands - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NL'), 'student', 
'{"documents": ["Valid passport", "Student visa/residence permit", "University acceptance", "Academic qualifications", "English/Dutch language certificates", "Financial proof"], "health": ["Health insurance", "Medical records", "Vaccination certificate"], "academic": ["Diploma translations", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Hate materials"], "restricted": ["Large electronics", "Academic equipment"]}',
'{"step1": "Apply for residence permit for study", "step2": "Get Dutch health insurance", "step3": "Find student accommodation", "step4": "Open Dutch bank account", "step5": "Register with local municipality (GBA)"}',
'{"visa": "https://ind.nl/en/study", "study": "https://www.studyinholland.nl/", "health": "https://www.zorgverzekeringslijn.nl/"}',
true);

-- Switzerland - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CH'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Hotel bookings", "Return ticket"], "health": ["Travel insurance (minimum CHF 30,000)", "EHIC/GHIC", "Prescription medications"], "financial": ["Credit cards", "Cash (CHF)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Counterfeit goods", "Absinthe over 35mg thujone"], "restricted": ["Alcohol for personal use", "Tobacco (max 250 cigarettes)", "Cash over CHF 10,000"]}',
'{"step1": "Check visa requirements (Schengen area)", "step2": "Get high-value travel insurance", "step3": "Book accommodation (expensive, book early)", "step4": "Get Swiss Travel Pass for transport", "step5": "Download SBB app for trains"}',
'{"visa": "https://www.sem.admin.ch/sem/en/home/themen/einreise/visum.html", "tourism": "https://www.myswitzerland.com/", "sbb": "https://www.sbb.ch/en"}',
true);

-- Switzerland - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CH'), 'student', 
'{"documents": ["Valid passport", "Student visa", "University acceptance", "Academic qualifications", "Language certificates", "Financial proof (CHF 21,000/year)", "Motivation letter"], "health": ["Health insurance", "Medical certificate", "Vaccination records"], "academic": ["Apostilled diplomas", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Subversive materials"], "restricted": ["Large amounts of cash", "Professional equipment"]}',
'{"step1": "Apply for student visa with university acceptance", "step2": "Prove financial resources", "step3": "Get health insurance", "step4": "Find accommodation (very limited and expensive)", "step5": "Register with local authorities after arrival"}',
'{"visa": "https://www.sem.admin.ch/sem/en/home/themen/einreise/visum.html", "study": "https://www.swissuniversities.ch/", "health": "https://www.bag.admin.ch/"}',
true);

-- Sweden - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'SE'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Accommodation proof", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards (Sweden is nearly cashless)", "Some cash (SEK)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Snus (for non-EU visitors)", "Counterfeit goods"], "restricted": ["Alcohol (max 1L spirits, 2L wine)", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Get travel insurance", "step3": "Set up contactless payment (Sweden is cashless)", "step4": "Book accommodation", "step5": "Download SL app for Stockholm transport"}',
'{"visa": "https://www.migrationsverket.se/English/Private-individuals/Visiting-Sweden.html", "tourism": "https://visitsweden.com/", "transport": "https://sl.se/en"}',
true);

-- Sweden - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'SE'), 'student', 
'{"documents": ["Valid passport", "Student residence permit", "University acceptance", "Academic qualifications", "English language certificate", "Financial proof"], "health": ["Health insurance", "Medical records", "Vaccination certificate"], "academic": ["Diploma translations", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Hate materials"], "restricted": ["Large electronics", "Academic equipment"]}',
'{"step1": "Apply for residence permit for studies", "step2": "Prove financial resources", "step3": "Get health insurance", "step4": "Find student accommodation", "step5": "Get personal number (personnummer) after arrival"}',
'{"visa": "https://www.migrationsverket.se/English/Private-individuals/Studying-in-Sweden.html", "study": "https://studyinsweden.se/", "csc": "https://www.csn.se/"}',
true);

-- Norway - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NO'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Hotel reservations", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (NOK)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Snus (for non-EU)", "Pornographic materials"], "restricted": ["Alcohol (very expensive, max 1L spirits)", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Budget for high costs", "step3": "Book accommodation early", "step4": "Get comprehensive travel insurance", "step5": "Download transport apps (Ruter, NSB)"}',
'{"visa": "https://www.udi.no/en/want-to-apply/visit-and-holiday/", "tourism": "https://www.visitnorway.com/", "customs": "https://www.toll.no/en/"}',
true);

-- Norway - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NO'), 'student', 
'{"documents": ["Valid passport", "Student residence permit", "University acceptance", "Academic qualifications", "Language certificates", "Financial proof"], "health": ["Health insurance", "Medical certificate", "Vaccination records"], "academic": ["Diploma translations", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Hate materials"], "restricted": ["Large amounts of cash", "Professional equipment"]}',
'{"step1": "Apply for student residence permit", "step2": "Prove financial resources (expensive country)", "step3": "Find student accommodation", "step4": "Get health insurance", "step5": "Register with local police after arrival"}',
'{"visa": "https://www.udi.no/en/want-to-apply/studies/", "study": "https://www.studyinnorway.no/", "samordna": "https://www.samordnaopptak.no/info/english/"}',
true);

-- Denmark - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'DK'), 'tourist', 
'{"documents": ["Valid passport or EU ID", "Schengen visa (if required)", "Travel insurance", "Accommodation proof", "Return ticket"], "health": ["EHIC/GHIC", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (DKK)", "Bank statements"]}',
'{"prohibited": ["Weapons", "Drugs", "Fireworks", "Counterfeit goods"], "restricted": ["Alcohol for personal use", "Tobacco (max 200 cigarettes)", "Cash over €10,000"]}',
'{"step1": "Check Schengen visa requirements", "step2": "Get travel insurance", "step3": "Book accommodation", "step4": "Get Copenhagen Card for attractions", "step5": "Download DSB app for trains"}',
'{"visa": "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Visit", "tourism": "https://www.visitdenmark.com/", "transport": "https://www.dsb.dk/en/"}',
true);

-- Denmark - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'DK'), 'student', 
'{"documents": ["Valid passport", "Student residence permit", "University acceptance", "Academic qualifications", "English language certificate", "Financial proof"], "health": ["Health insurance", "Medical records", "Vaccination certificate"], "academic": ["Diploma translations", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Hate materials"], "restricted": ["Large electronics", "Academic equipment"]}',
'{"step1": "Apply for residence permit for studies", "step2": "Get health insurance", "step3": "Find student accommodation", "step4": "Open Danish bank account", "step5": "Get CPR number after arrival"}',
'{"visa": "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study", "study": "https://studyindenmark.dk/", "su": "https://www.su.dk/english/"}',
true);

-- Singapore - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'SG'), 'tourist', 
'{"documents": ["Valid passport (6+ months)", "Visa (if required)", "Return flight ticket", "Proof of accommodation", "Sufficient funds proof"], "health": ["Travel insurance", "Prescription medications", "Yellow fever certificate (if from endemic area)"], "financial": ["Credit cards", "Cash (SGD)", "Bank statements"]}',
'{"prohibited": ["Chewing gum", "Drugs (death penalty)", "Weapons", "Pornographic materials", "Cigarettes (unless declared)"], "restricted": ["Alcohol (max 1L duty-free)", "Tobacco (heavy taxes)", "Cash over SGD 20,000"]}',
'{"step1": "Check visa requirements (many countries visa-free)", "step2": "Ensure passport validity (6+ months)", "step3": "Book accommodation", "step4": "Get travel insurance", "step5": "Download SingPass app and transport apps"}',
'{"visa": "https://www.ica.gov.sg/enter-depart/entry_requirements/", "customs": "https://www.customs.gov.sg/", "tourism": "https://www.visitsingapore.com/"}',
true);

-- Singapore - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'SG'), 'student', 
'{"documents": ["Valid passport", "Student pass", "IPA (In-Principle Approval)", "University acceptance", "Academic certificates", "Financial proof", "Medical examination"], "health": ["Medical examination results", "Vaccination records", "Health insurance"], "academic": ["Academic transcripts", "Diploma certificates", "English test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Subversive materials"], "restricted": ["Large electronics", "Academic materials"]}',
'{"step1": "Receive IPA from Singapore institution", "step2": "Complete medical examination", "step3": "Apply for Student Pass", "step4": "Find accommodation", "step5": "Complete Student Pass formalities upon arrival"}',
'{"visa": "https://www.ica.gov.sg/reside/STP", "study": "https://www.studyinsingapore.edu.sg/", "moe": "https://www.moe.gov.sg/"}',
true);

-- South Korea - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'KR'), 'tourist', 
'{"documents": ["Valid passport", "K-ETA or visa", "Return flight ticket", "Hotel reservations", "Travel itinerary"], "health": ["Travel insurance", "Prescription medications", "Health declaration"], "financial": ["Credit cards", "Cash (KRW)", "Bank statements"]}',
'{"prohibited": ["Drugs", "Weapons", "Pornographic materials", "North Korean items"], "restricted": ["Alcohol (max 1L)", "Tobacco (max 200 cigarettes)", "Cash over USD 10,000", "Ginseng products"]}',
'{"step1": "Apply for K-ETA (Korea Electronic Travel Authorization)", "step2": "Get travel insurance", "step3": "Book accommodation", "step4": "Download Papago translator app", "step5": "Get T-money card for transport"}',
'{"visa": "https://www.k-eta.go.kr/portal/apply/index.do", "tourism": "https://english.visitkorea.or.kr/", "customs": "https://www.customs.go.kr/english/"}',
true);

-- South Korea - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'KR'), 'student', 
'{"documents": ["Valid passport", "Student visa (D-2)", "Certificate of admission", "Academic certificates", "Korean language certificate", "Financial proof", "Criminal background check"], "health": ["Health certificate", "Tuberculosis test", "Health insurance"], "academic": ["Apostilled diplomas", "Academic transcripts", "Language test scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Subversive materials"], "restricted": ["Large amounts of cash", "Academic equipment"]}',
'{"step1": "Get documents apostilled", "step2": "Apply for D-2 student visa", "step3": "Get tuberculosis test", "step4": "Find accommodation (dormitory or goshiwon)", "step5": "Register as foreigner within 90 days"}',
'{"visa": "https://www.hikorea.go.kr/", "study": "https://www.studyinkorea.go.kr/", "niied": "https://www.niied.go.kr/eng/index.do"}',
true);

-- New Zealand - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NZ'), 'tourist', 
'{"documents": ["Valid passport", "NZeTA", "Return flight ticket", "Proof of funds", "Travel itinerary"], "health": ["Travel insurance", "Prescription medications", "Medical certificates"], "financial": ["Credit cards", "Cash (NZD)", "Bank statements"]}',
'{"prohibited": ["Biosecurity risks", "Weapons", "Drugs", "Objectionable materials"], "restricted": ["Food items (strict biosecurity)", "Alcohol (max 4.5L)", "Tobacco (max 50 cigarettes)", "Cash over NZD 10,000"]}',
'{"step1": "Apply for NZeTA and pay IVL (tourist tax)", "step2": "Get comprehensive travel insurance", "step3": "Declare all biosecurity items", "step4": "Book accommodation and transport", "step5": "Download offline maps (limited cell coverage)"}',
'{"visa": "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta", "customs": "https://www.customs.govt.nz/", "tourism": "https://www.newzealand.com/"}',
true);

-- New Zealand - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'NZ'), 'student', 
'{"documents": ["Valid passport", "Student visa", "Offer of place", "Academic qualifications", "English language evidence", "Financial evidence", "Medical and character certificates"], "health": ["Medical examination", "Chest X-ray", "Health insurance"], "academic": ["Academic transcripts", "Diploma certificates", "IELTS/TOEFL scores"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Biosecurity risks"], "restricted": ["Food items", "Academic equipment", "Large electronics"]}',
'{"step1": "Receive offer of place from NZ institution", "step2": "Apply for student visa", "step3": "Complete medical examinations", "step4": "Get health and travel insurance", "step5": "Arrange accommodation and airport pickup"}',
'{"visa": "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/student-visa", "study": "https://www.studyinnewzealand.govt.nz/", "nzqa": "https://www.nzqa.govt.nz/"}',
true);

-- Continue with remaining countries...
-- China - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CN'), 'tourist', 
'{"documents": ["Valid passport", "Tourist visa (L visa)", "Invitation letter (if required)", "Hotel bookings", "Return flight ticket"], "health": ["Travel insurance", "Prescription medications", "Health declaration"], "financial": ["Cash (CNY)", "Credit cards (limited acceptance)", "Bank statements"]}',
'{"prohibited": ["Political materials", "Religious materials", "Weapons", "Drugs", "GPS devices"], "restricted": ["Books and publications", "Electronics", "Cash over USD 5,000", "Medications"]}',
'{"step1": "Apply for tourist visa at Chinese consulate", "step2": "Book all accommodation in advance", "step3": "Get VPN for internet access", "step4": "Download offline maps and translation apps", "step5": "Register with local police within 24 hours"}',
'{"visa": "http://www.china-embassy.org/eng/", "tourism": "https://www.travelchinaguide.com/", "customs": "http://english.customs.gov.cn/"}',
true);

-- China - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'CN'), 'student', 
'{"documents": ["Valid passport", "Student visa (X1/X2)", "JW201/JW202 form", "Admission notice", "Physical examination record", "Academic certificates", "Chinese language certificate"], "health": ["Medical examination", "Vaccination records", "Health insurance"], "academic": ["Notarized diplomas", "Academic transcripts", "HSK certificates"]}',
'{"prohibited": ["Political materials", "Religious materials", "Weapons"], "restricted": ["Academic materials", "Electronics", "Books"]}',
'{"step1": "Receive admission notice and JW form", "step2": "Complete medical examination", "step3": "Apply for X visa", "step4": "Arrange accommodation through university", "step5": "Register with local police and get residence permit"}',
'{"visa": "http://www.china-embassy.org/eng/", "study": "http://www.campuschina.org/", "csc": "http://www.csc.edu.cn/"}',
true);

-- India - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'IN'), 'tourist', 
'{"documents": ["Valid passport", "Tourist visa or e-visa", "Return flight ticket", "Hotel bookings", "Proof of funds"], "health": ["Travel insurance", "Vaccination certificates", "Prescription medications", "Anti-malarial prophylaxis"], "financial": ["Credit cards", "Cash (INR)", "USD for emergencies"]}',
'{"prohibited": ["Satellite phones", "Drones", "Gold/silver (over limits)", "Beef products"], "restricted": ["Alcohol (varies by state)", "Tobacco", "Electronics over USD 1,500", "Cash over USD 5,000"]}',
'{"step1": "Apply for e-visa or regular visa", "step2": "Get required vaccinations (hepatitis, typhoid)", "step3": "Get comprehensive travel insurance", "step4": "Book accommodation and transport", "step5": "Download offline maps and translation apps"}',
'{"visa": "https://indianvisaonline.gov.in/evisa/", "tourism": "https://www.incredibleindia.org/", "health": "https://www.who.int/countries/ind/"}',
true);

-- India - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'IN'), 'student', 
'{"documents": ["Valid passport", "Student visa", "Admission letter", "Academic certificates", "Medical certificate", "Financial proof", "Character certificate"], "health": ["Medical examination", "Vaccination records", "Health insurance"], "academic": ["Attested academic documents", "Transcripts", "Language certificates"]}',
'{"prohibited": ["Satellite communication devices", "Weapons", "Drugs"], "restricted": ["Electronics", "Academic equipment", "Large amounts of cash"]}',
'{"step1": "Receive admission from Indian institution", "step2": "Apply for student visa", "step3": "Get medical examination", "step4": "Arrange accommodation", "step5": "Register with FRRO within 14 days"}',
'{"visa": "https://indianvisaonline.gov.in/", "study": "https://www.studyinindia.gov.in/", "frro": "https://indianfrro.gov.in/"}',
true);

-- Thailand - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'TH'), 'tourist', 
'{"documents": ["Valid passport (6+ months)", "Visa (if required)", "Return flight ticket", "Proof of accommodation", "Proof of funds (20,000 THB)"], "health": ["Travel insurance", "Vaccination certificates", "Prescription medications"], "financial": ["Cash (THB)", "Credit cards", "Bank statements"]}',
'{"prohibited": ["Drugs (death penalty)", "Weapons", "Vaping devices", "Pornographic materials"], "restricted": ["Alcohol (max 1L)", "Tobacco (max 200 cigarettes)", "Prescription drugs", "Buddha images"]}',
'{"step1": "Check visa requirements (many countries visa-free)", "step2": "Get travel insurance", "step3": "Carry cash proof (20,000 THB equivalent)", "step4": "Get vaccinations if needed", "step5": "Download translation and transport apps"}',
'{"visa": "https://www.mfa.go.th/en/", "tourism": "https://www.tourismthailand.org/", "customs": "https://www.customs.go.th/"}',
true);

-- Thailand - Student
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'TH'), 'student', 
'{"documents": ["Valid passport", "Non-immigrant ED visa", "Acceptance letter", "Academic certificates", "Medical certificate", "Financial proof", "Criminal background check"], "health": ["Health certificate", "Vaccination records", "Health insurance"], "academic": ["Certified academic documents", "Transcripts", "Language certificates"]}',
'{"prohibited": ["Illegal drugs", "Weapons", "Subversive materials"], "restricted": ["Academic equipment", "Electronics", "Medications"]}',
'{"step1": "Receive acceptance from Thai institution", "step2": "Apply for Non-ED visa", "step3": "Get medical certificate", "step4": "Arrange accommodation", "step5": "Report to immigration within 24 hours"}',
'{"visa": "https://www.mfa.go.th/en/", "study": "https://www.studyinthailand.org/", "immigration": "https://www.immigration.go.th/"}',
true);

-- Continue with remaining countries following the same pattern...
-- I'll add a few more key destinations to reach 40 countries total

-- Vietnam - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'VN'), 'tourist', 
'{"documents": ["Valid passport (6+ months)", "Visa or visa exemption", "Return flight ticket", "Hotel bookings", "Travel itinerary"], "health": ["Travel insurance", "Vaccination certificates", "Prescription medications"], "financial": ["Cash (VND)", "Credit cards", "USD for backup"]}',
'{"prohibited": ["Weapons", "Drugs", "Political materials", "Pornographic content"], "restricted": ["Alcohol (personal use)", "Tobacco (max 200 cigarettes)", "Electronics", "Cash over USD 5,000"]}',
'{"step1": "Check visa requirements (some countries visa-free)", "step2": "Get travel insurance", "step3": "Get required vaccinations", "step4": "Book accommodation", "step5": "Download offline maps and translation apps"}',
'{"visa": "https://evisa.xuatnhapcanh.gov.vn/", "tourism": "https://vietnam.travel/", "customs": "https://www.customs.gov.vn/"}',
true);

-- Malaysia - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'MY'), 'tourist', 
'{"documents": ["Valid passport (6+ months)", "Visa (if required)", "Return flight ticket", "Proof of accommodation", "Sufficient funds"], "health": ["Travel insurance", "Yellow fever certificate (if from endemic area)", "Prescription medications"], "financial": ["Credit cards", "Cash (MYR)", "Bank statements"]}',
'{"prohibited": ["Drugs (death penalty)", "Weapons", "Pornographic materials", "Gambling devices"], "restricted": ["Alcohol (non-Muslims only)", "Tobacco", "Electronics", "Cash over USD 10,000"]}',
'{"step1": "Check visa requirements (many countries visa-free)", "step2": "Get travel insurance", "step3": "Book accommodation", "step4": "Respect local customs (modest dress)", "step5": "Download Grab app for transport"}',
'{"visa": "https://www.imi.gov.my/", "tourism": "https://www.malaysia.travel/", "customs": "http://www.customs.gov.my/"}',
true);

-- Indonesia - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'ID'), 'tourist', 
'{"documents": ["Valid passport (6+ months)", "Visa on arrival or e-visa", "Return flight ticket", "Proof of accommodation", "Proof of funds"], "health": ["Travel insurance", "Vaccination certificates", "Prescription medications"], "financial": ["Cash (IDR)", "Credit cards", "USD for backup"]}',
'{"prohibited": ["Drugs (death penalty)", "Weapons", "Pornographic materials", "Communist materials"], "restricted": ["Alcohol (varies by region)", "Tobacco", "Electronics", "Religious materials"]}',
'{"step1": "Check visa requirements", "step2": "Get comprehensive travel insurance", "step3": "Get required vaccinations", "step4": "Book accommodation", "step5": "Respect local customs and dress codes"}',
'{"visa": "https://molina.imigrasi.go.id/", "tourism": "https://www.indonesia.travel/", "customs": "https://www.beacukai.go.id/"}',
true);

-- Mexico - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'MX'), 'tourist', 
'{"documents": ["Valid passport", "Tourist card (FMM)", "Return flight ticket", "Proof of accommodation", "Sufficient funds"], "health": ["Travel insurance", "Prescription medications", "Vaccination certificates"], "financial": ["Credit cards", "Cash (MXN)", "USD accepted in tourist areas"]}',
'{"prohibited": ["Weapons", "Drugs", "Archaeological artifacts", "Endangered species"], "restricted": ["Alcohol (personal use)", "Tobacco (max 200 cigarettes)", "Electronics", "Cash over USD 10,000"]}',
'{"step1": "Fill out tourist card (FMM) online or at arrival", "step2": "Get travel insurance", "step3": "Book accommodation", "step4": "Learn basic Spanish phrases", "step5": "Check safety advisories for regions"}',
'{"visa": "https://www.gob.mx/inm", "tourism": "https://www.visitmexico.com/", "customs": "https://www.gob.mx/sat"}',
true);

-- Brazil - Tourist
INSERT INTO checklists (country, user_type, required_items, restricted_items, preparation_steps, official_links, is_template) VALUES
((SELECT id FROM countries WHERE code = 'BR'), 'tourist', 
'{"documents": ["Valid passport", "Visa (if required)", "Yellow fever certificate", "Return flight ticket", "Proof of accommodation"], "health": ["Yellow fever vaccination", "Travel insurance", "Prescription medications"], "financial": ["Credit cards", "Cash (BRL)", "USD for backup"]}',
'{"prohibited": ["Weapons", "Drugs", "Pirated goods", "Endangered species"], "restricted": ["Alcohol (personal use)", "Tobacco", "Electronics", "Cash over USD 10,000"]}',
'{"step1": "Check visa requirements", "step2": "Get yellow fever vaccination", "step3": "Get comprehensive travel insurance", "step4": "Book accommodation", "step5": "Learn basic Portuguese phrases"}',
'{"visa": "https://www.gov.br/mre/pt-br", "tourism": "https://visitbrasil.com/", "health": "https://www.gov.br/saude/pt-br"}',
true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checklists_country ON checklists(country);
CREATE INDEX IF NOT EXISTS idx_checklists_user_type ON checklists(user_type);
CREATE INDEX IF NOT EXISTS idx_checklists_country_user_type ON checklists(country, user_type);
