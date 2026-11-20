export interface StandardTrade {
  id: string;
  names: {
    mr: string;
    hi: string;
    en: string;
  };
  skills: {
    id: string;
    names: {
      mr: string;
      hi: string;
      en: string;
    };
  }[];
}

export const REGIONAL_TRADES: StandardTrade[] = [
  {
    id: 'electrician',
    names: {
      mr: 'इलेक्ट्रिशियन / वायरमन',
      hi: 'इलेक्ट्रिशियन / वायरमैन',
      en: 'Electrician / Wireman'
    },
    skills: [
      { id: 'house_wiring', names: { mr: 'घरगुती वायरिंग', hi: 'घरेलू वायरिंग', en: 'House Wiring' } },
      { id: 'industrial_panel', names: { mr: 'इंडस्ट्रियल पॅनल असेंब्ली', hi: 'औद्योगिक पैनल असेंबली', en: 'Industrial Panel Assembly' } },
      { id: 'motor_rewinding', names: { mr: 'मोटर रिवाइंडिंग', hi: 'मोटर रिवाइंडिंग', en: 'Motor Rewinding' } },
      { id: 'transformer_maintenance', names: { mr: 'ट्रान्सफॉर्मर देखभाल', hi: 'ट्रांसफॉर्मर रखरखाव', en: 'Transformer Maintenance' } },
      { id: 'solar_pv_wiring', names: { mr: 'सोलर पॅनल वायरिंग', hi: 'सोलर पैनल वायरिंग', en: 'Solar PV Wiring' } }
    ]
  },
  {
    id: 'welder',
    names: {
      mr: 'वेल्डर / फॅब्रिकेटर',
      hi: 'वेल्डर / फैब्रिकेटर',
      en: 'Welder / Fabricator'
    },
    skills: [
      { id: 'arc_welding', names: { mr: 'आर्क वेल्डिंग', hi: 'आर्क वेल्डिंग', en: 'Arc Welding' } },
      { id: 'mig_welding', names: { mr: 'एमआयजी (MIG) वेल्डिंग', hi: 'एमआईजी (MIG) वेल्डिंग', en: 'MIG Welding' } },
      { id: 'tig_welding', names: { mr: 'टीआयजी (TIG) वेल्डिंग', hi: 'टीआईजी (TIG) वेल्डिंग', en: 'TIG Welding' } },
      { id: 'sheet_metal_fabrication', names: { mr: 'शीट मेटल फॅब्रिकेशन', hi: 'शीट मेटल फैब्रिकेशन', en: 'Sheet Metal Fabrication' } },
      { id: 'gas_cutting', names: { mr: 'गॅस कटिंग', hi: 'गैस कटिंग', en: 'Gas Cutting' } }
    ]
  },
  {
    id: 'fitter_turner',
    names: {
      mr: 'फिटर / टर्नर / मेकॅनिस्ट',
      hi: 'फ़िटर / टर्नर / मशीनिस्ट',
      en: 'Fitter / Turner / Machinist'
    },
    skills: [
      { id: 'lathe_operation', names: { mr: 'लेथ मशिन ऑपरेशन्स', hi: 'लेथ मशीन संचालन', en: 'Lathe Machine Operation' } },
      { id: 'cnc_operation', names: { mr: 'सीएनसी (CNC) ऑपरेटर', hi: 'सीएनसी (CNC) ऑपरेटर', en: 'CNC Operation' } },
      { id: 'bench_work_filing', names: { mr: 'बेंच वर्क व फायलिंग', hi: 'बेंच वर्क और फाइलिंग', en: 'Bench Work & Filing' } },
      { id: 'precision_measurement', names: { mr: 'व्हर्नियर कॅलिपर व मायक्रोमीटर मोजमाप', hi: 'सटीक मापन उपकरण', en: 'Precision Measurement' } }
    ]
  },
  {
    id: 'mechanic',
    names: {
      mr: 'ऑटोमोबाईल व ट्रॅक्टर मेकॅनिक',
      hi: 'ऑटोमोबाइल और ट्रैक्टर मैकेनिक',
      en: 'Automobile & Tractor Mechanic'
    },
    skills: [
      { id: 'diesel_engine_repair', names: { mr: 'डिझेल इंजिन दुरुस्ती', hi: 'डीजल इंजन मरम्मत', en: 'Diesel Engine Repair' } },
      { id: 'two_wheeler_servicing', names: { mr: 'टू-व्हीलर सर्व्हिसिंग', hi: 'टू-व्हीलर सर्विसिंग', en: 'Two-Wheeler Servicing' } },
      { id: 'tractor_hydraulics', names: { mr: 'ट्रॅक्टर हायड्रॉलिक्स', hi: 'ट्रैक्टर हाइड्रोलिक्स', en: 'Tractor Hydraulics' } },
      { id: 'brake_clutch_overhaul', names: { mr: 'ब्रेक व क्लच ओव्हरहॉल', hi: 'ब्रेक और क्लच मरम्मत', en: 'Brake & Clutch Overhaul' } }
    ]
  },
  {
    id: 'plumber',
    names: {
      mr: 'प्लंबर / पाईप फिटर',
      hi: 'प्लंबर / पाइप फिटर',
      en: 'Plumber / Pipe Fitter'
    },
    skills: [
      { id: 'pvc_gi_pipe_fitting', names: { mr: 'पीव्हीसी व जीआय पाईप फिटिंग', hi: 'पीवीसी और जीआई पाइप फिटिंग', en: 'PVC & GI Pipe Fitting' } },
      { id: 'leakage_repair', names: { mr: 'गळती शोधणे व दुरुस्ती', hi: 'रिसाव मरम्मत', en: 'Leakage Detection & Repair' } },
      { id: 'sanitary_installation', names: { mr: 'सॅनिटरी फिटिंग्ज', hi: 'सेनेटरी फिटिंग', en: 'Sanitary Fittings' } },
      { id: 'water_pump_installation', names: { mr: 'वॉटर पंप इन्स्टॉलेशन', hi: 'पानी का पंप लगाना', en: 'Water Pump Installation' } }
    ]
  },
  {
    id: 'agriculture_dairy',
    names: {
      mr: 'दुग्ध व्यवसाय / कृषी / पशुसंवर्धन',
      hi: 'डेयरी व्यवसाय / कृषि / पशुपालन',
      en: 'Dairy Farming / Agriculture / Livestock'
    },
    skills: [
      { id: 'dairy_milk_collection', names: { mr: 'दूध संकलन व फॅट चाचणी', hi: 'दूध संकलन एवं फैट जांच', en: 'Milk Collection & Fat Testing' } },
      { id: 'cattle_care_feeding', names: { mr: 'पशुसंवर्धन व चारा व्यवस्थापन', hi: 'पशुपालन एवं चारा प्रबंधन', en: 'Cattle Care & Feed Management' } },
      { id: 'tractor_farming_equipment', names: { mr: 'ट्रॅक्टर व आधुनिक शेती अवजारे', hi: 'ट्रैक्टर एवं कृषि उपकरण', en: 'Tractor & Farm Implements' } },
      { id: 'crop_harvesting_spraying', names: { mr: 'पीक काढणी व औषध फवारणी', hi: 'फसल कटाई एवं कीटनाशक छिड़काव', en: 'Crop Harvesting & Spraying' } }
    ]
  },
  {
    id: 'tailoring_fashion',
    names: {
      mr: 'शिंपी / टेलरिंग / फॅशन डिझाईन',
      hi: 'टेलरिंग / सिलाई / फैशन डिज़ाइन',
      en: 'Tailoring / Garment Stitching / Boutique'
    },
    skills: [
      { id: 'garment_stitching_tailoring', names: { mr: 'शिलाई व कपडे शिवणे', hi: 'सिलाई एवं परिधान निर्माण', en: 'Garment Stitching & Tailoring' } },
      { id: 'blouse_dress_pattern_cutting', names: { mr: 'ब्लाऊज व ड्रेस पॅटर्न कटिंग', hi: 'ब्लाउज एवं सूट पैटर्न कटिंग', en: 'Pattern Cutting & Dressmaking' } },
      { id: 'alterations_embroidery', names: { mr: 'अल्टरेशन व भरतकाम (एम्ब्रॉयडरी)', hi: 'अल्टरेशन एवं कढ़ाई', en: 'Alterations & Embroidery' } }
    ]
  },
  {
    id: 'beauty_wellness',
    names: {
      mr: 'ब्युटी पार्लर / सलून / हेअर स्टायलिस्ट',
      hi: 'ब्यूटी पार्लर / सैलून / हेयर स्टाइलिस्ट',
      en: 'Beauty Parlour / Salon / Grooming'
    },
    skills: [
      { id: 'beauty_parlour_services', names: { mr: 'फेशिअल, थ्रेडिंग व स्किनकेअर', hi: 'फेशियल, थ्रेडिंग एवं स्किन केयर', en: 'Facial, Threading & Skincare' } },
      { id: 'bridal_makeup_styling', names: { mr: 'ब्रायडल मेकअप व हेअर स्टायलिंग', hi: 'दुल्हन मेकअप एवं हेयर स्टाइल', en: 'Bridal Makeup & Hair Styling' } },
      { id: 'salon_haircutting', names: { mr: 'केशकर्तन व ग्रूमिंग', hi: 'बाल कटिंग एवं ग्रूमिंग', en: 'Haircutting & Mens Grooming' } }
    ]
  },
  {
    id: 'electronics_repair',
    names: {
      mr: 'मोबाईल व इलेक्ट्रॉनिक्स दुरुस्ती',
      hi: 'मोबाइल एवं इलेक्ट्रॉनिक्स रिपेयरिंग',
      en: 'Mobile & Electronics Repair'
    },
    skills: [
      { id: 'mobile_hardware_repair', names: { mr: 'मोबाईल स्क्रीन व हार्डवेअर दुरुस्ती', hi: 'मोबाइल स्क्रीन व हार्डवेयर रिपेयर', en: 'Mobile Screen & Hardware Repair' } },
      { id: 'chip_level_soldering', names: { mr: 'चिप लेव्हल सोल्डरिंग व सर्किट तपासणी', hi: 'चिप लेवल सोल्डरिंग व सर्किट जांच', en: 'Chip-Level Soldering & Diagnostics' } },
      { id: 'home_appliance_servicing', names: { mr: 'घरगुती उपकरणे दुरुस्ती (मिक्सर/फॅन)', hi: 'घरेलू उपकरण मरम्मत (मिक्सर/फैन)', en: 'Home Appliance Servicing' } }
    ]
  },
  {
    id: 'solar_renewable',
    names: {
      mr: 'सोलर पॅनल व इन्व्हर्टर तंत्रज्ञ',
      hi: 'सोलर पैनल एवं इन्वर्टर तकनीशियन',
      en: 'Solar PV & Inverter Technician'
    },
    skills: [
      { id: 'solar_panel_installation', names: { mr: 'सोलर पॅनल रूफटॉप माउंटिंग', hi: 'सोलर पैनल रूफटॉप माउंटिंग', en: 'Rooftop Solar Mounting' } },
      { id: 'inverter_battery_wiring', names: { mr: 'इन्व्हर्टर व बॅटरी वायरिंग', hi: 'इन्वर्टर और बैटरी वायरिंग', en: 'Inverter & Battery Wiring' } },
      { id: 'solar_system_maintenance', names: { mr: 'सोलर यंत्रणा तपासणी व देखभाल', hi: 'सोलर सिस्टम रखरखाव', en: 'Solar PV Maintenance' } }
    ]
  },
  {
    id: 'food_catering',
    names: {
      mr: 'खानावळ / केटरिंग / हलवाई / मेस',
      hi: 'कैटरिंग / हलवाई / मेस / खान-पान',
      en: 'Food Catering / Confectionery / Mess'
    },
    skills: [
      { id: 'commercial_cooking', names: { mr: 'व्यावसायिक स्वयंपाक व अन्न तयारी', hi: 'वाणिज्यिक कुकिंग एवं खान-पान', en: 'Commercial Cooking & Food Prep' } },
      { id: 'traditional_confectionery', names: { mr: 'मिठाई व हलवाई काम', hi: 'मिठाई एवं हलवाई निर्माण', en: 'Traditional Sweets & Confectionery' } },
      { id: 'tiffin_mess_cooking', names: { mr: 'मेस व डबा स्वयंपाक', hi: 'मेस व टिफिन भोजन निर्माण', en: 'Tiffin & Mess Meal Preparation' } }
    ]
  },
  {
    id: 'printing_media',
    names: {
      mr: 'डीटीपी / फ्लेक्स प्रिंटिंग / झेरॉक्स',
      hi: 'डीटीपी / फ्लेक्स प्रिंटिंग / फोटोकॉपी',
      en: 'DTP / Flex Printing / Media'
    },
    skills: [
      { id: 'dtp_marathi_typesetting', names: { mr: 'डीटीपी व मराठी टायपिंग (DTP)', hi: 'डीटीपी एवं मराठी टाइपिंग', en: 'DTP & Marathi Typesetting' } },
      { id: 'flex_banner_printing', names: { mr: 'फ्लेक्स व बॅनर प्रिंटिंग', hi: 'फ्लेक्स एवं बैनर प्रिंटिंग', en: 'Flex & Digital Banner Printing' } },
      { id: 'offset_lamination', names: { mr: 'झेरॉक्स, लॅमिनेशन व बायंडिंग', hi: 'फोटोकॉपी, लैमिनेशन व बाइंडिंग', en: 'Photocopy & Lamination' } }
    ]
  },
  {
    id: 'transport_fleet',
    names: {
      mr: 'ऑटो / ई-रिक्षा / व्यावसायिक चालक',
      hi: 'ऑटो / ई-रिक्शा / कमर्शियल ड्राइवर',
      en: 'Auto Rickshaw / Fleet & Commercial Driver'
    },
    skills: [
      { id: 'auto_commercial_driving', names: { mr: 'ऑटो / ई-रिक्षा / प्रवासी वाहतूक', hi: 'ऑटो / ई-रिक्शा संचालन', en: 'Auto / E-Rickshaw Passenger Transport' } },
      { id: 'heavy_vehicle_driving', names: { mr: 'जड वाहन चालक (HGV/LMV परवाना)', hi: 'भारी वाहन चालक', en: 'Heavy/Light Commercial Driving' } },
      { id: 'local_route_navigation', names: { mr: 'स्थानिक रस्ते व सुरक्षित प्रवास', hi: 'स्थानीय मार्ग ज्ञान एवं सुरक्षा', en: 'Local Navigation & Safety' } }
    ]
  },
  {
    id: 'logistics_warehouse',
    names: {
      mr: 'वेअरहाऊस / पॅकिंग / वितरण',
      hi: 'वेयरहाउस / पैकिंग / वितरण',
      en: 'Warehouse / Packing / Dispatch'
    },
    skills: [
      { id: 'forklift_driving', names: { mr: 'फोर्कलिफ्ट ड्रायव्हिंग', hi: 'फोर्कलिफ्ट ड्राइविंग', en: 'Forklift Driving' } },
      { id: 'inventory_sorting', names: { mr: 'मालाची वर्गवारी व बारकोड स्कॅनिंग', hi: 'इन्वेंट्री सॉर्टिंग', en: 'Inventory Sorting & Scanning' } },
      { id: 'dispatch_packing', names: { mr: 'डिसपॅच पॅकिंग', hi: 'डिस्पैच पैकिंग', en: 'Dispatch & Packing' } }
    ]
  },
  {
    id: 'computer_operator',
    names: {
      mr: 'डेटा एंट्री / कॉम्प्युटर ऑपरेटर / टॅली',
      hi: 'डेटा एंट्री / कंप्यूटर ऑपरेटर / टैली',
      en: 'Data Entry / Computer Operator / Tally'
    },
    skills: [
      { id: 'marathi_typing', names: { mr: 'मराठी टायपिंग (GCC-TBC)', hi: 'मराठी टाइपिंग', en: 'Marathi Typing' } },
      { id: 'ms_excel_tally', names: { mr: 'एमएस एक्सेल व टॅली (Tally)', hi: 'एक्सेल और टैली', en: 'MS Excel & Tally' } },
      { id: 'billing_inventory_entry', names: { mr: 'बिलिंग व इनव्हॉइस एंट्री', hi: 'बिलिंग प्रविष्टि', en: 'Billing & Invoice Entry' } }
    ]
  },
  {
    id: 'retail_sales',
    names: {
      mr: 'दुकानदार / सेल्स एक्झिक्युटिव्ह / कॅशियर',
      hi: 'दुकानदार / सेल्स एग्जीक्यूटिव / कैशियर',
      en: 'Retail Sales / Shop Assistant / Cashier'
    },
    skills: [
      { id: 'counter_sales', names: { mr: 'काउंटर सेल्स व ग्राहक संवाद', hi: 'काउंटर सेल्स एवं ग्राहक सेवा', en: 'Counter Sales & Customer Service' } },
      { id: 'cash_handling', names: { mr: 'रोकड व्यवस्थापन व पीओएस (POS)', hi: 'कैश हैंडलिंग एवं पीओएस', en: 'Cash Handling & POS Billing' } },
      { id: 'stock_display', names: { mr: 'स्टॉक मांडणी व इन्व्हेंटरी तपासणी', hi: 'स्टॉक डिस्प्ले एवं माल जांच', en: 'Stock Display & Store Merchandising' } }
    ]
  },
  {
    id: 'hospitality_support',
    names: {
      mr: 'हॉटेल / कार्यालय सहाय्यक / पँट्री',
      hi: 'होटल / ऑफिस सहायक / पेंट्री',
      en: 'Hospitality / Office Assistant / Pantry'
    },
    skills: [
      { id: 'commercial_cooking', names: { mr: 'व्यावसायिक स्वयंपाक', hi: 'वाणिज्यिक कुकिंग', en: 'Commercial Cooking' } },
      { id: 'office_pantry_support', names: { mr: 'कार्यालय व पँट्री सहाय्य', hi: 'कार्यालय एवं पेंट्री सहयोग', en: 'Office & Pantry Support' } },
      { id: 'cleaning_hygiene', names: { mr: 'स्वच्छता व निर्जंतुकीकरण', hi: 'सफाई एवं स्वच्छता', en: 'Facility Sanitation & Hygiene' } }
    ]
  },
  {
    id: 'healthcare_assistant',
    names: {
      mr: 'रुग्णालय व क्लिनिक सहाय्यक / केअरटेकर',
      hi: 'अस्पताल व क्लिनिक सहायक / केयरटेकर',
      en: 'Healthcare Assistant / Patient Caretaker'
    },
    skills: [
      { id: 'patient_care', names: { mr: 'रुग्ण शुश्रूषा व प्राथमिक काळजी', hi: 'रोगी देखभाल एवं प्राथमिक सेवा', en: 'General Patient Care' } },
      { id: 'vitals_check', names: { mr: 'रक्तदाब व नाडी मोजणे (Vitals)', hi: 'बीपी व वाइटल्स जांच', en: 'Vitals & BP Monitoring' } },
      { id: 'clinic_registration', names: { mr: 'रुग्ण नोंदणी व फाईल व्यवस्थापन', hi: 'ओपीडी रजिस्ट्रेशन व फाइलिंग', en: 'Clinic OPD Registration' } }
    ]
  },
  {
    id: 'security_facilities',
    names: {
      mr: 'सुरक्षा रक्षक / फॅसिलिटी सुपरवायझर',
      hi: 'सुरक्षा गार्ड / फैसिलिटी सुपरवाइजर',
      en: 'Security Guard / Facility Supervisor'
    },
    skills: [
      { id: 'gate_security', names: { mr: 'गेट सुरक्षा व व्हिजिटर नोंदवही', hi: 'गेट सुरक्षा एवं आगंतुक रजिस्टर', en: 'Gate Security & Visitor Management' } },
      { id: 'cctv_monitoring', names: { mr: 'सीसीटीव्ही निरीक्षण', hi: 'सीसीटीवी निगरानी', en: 'CCTV Surveillance' } },
      { id: 'fire_safety', names: { mr: 'अग्निशमन व प्राथमिक सुरक्षा', hi: 'अग्नि सुरक्षा उपकरण', en: 'Basic Fire Safety' } }
    ]
  },
  {
    id: 'construction_masonry',
    names: {
      mr: 'बांधकाम / गवंडी / पेंटर / सुतारकाम',
      hi: 'निर्माण / राजमिस्त्री / पेंटर / बढ़ई',
      en: 'Construction / Mason / Painter / Carpenter'
    },
    skills: [
      { id: 'brickwork_masonry', names: { mr: 'गवंडी काम व प्लास्टर', hi: 'राजमिस्त्री काम व प्लास्टर', en: 'Masonry & Plastering' } },
      { id: 'wall_painting', names: { mr: 'रंगकाम व पुट्टी लावणे', hi: 'पेंटिंग व पुट्टी काम', en: 'Wall Painting & Putty' } },
      { id: 'carpentry_woodwork', names: { mr: 'सुतारकाम व लाकडी फिटिंग', hi: 'बढ़ई काम व लकड़ी फिटिंग', en: 'Carpentry & Woodwork' } }
    ]
  },
  {
    id: 'general_flexible',
    names: {
      mr: 'इतर कोणताही कामाचा प्रकार / सर्वसामान्य मदतनीस',
      hi: 'अन्य कोई भी कार्य / सामान्य सहायक',
      en: 'Any General Work / Custom Vocation'
    },
    skills: [
      { id: 'general_helper', names: { mr: 'सर्वसामान्य मदतनीस / स्थानिक काम', hi: 'सामान्य सहायक / स्थानीय कार्य', en: 'General Helper / On-Site Support' } },
      { id: 'quick_learner', names: { mr: 'जलद शिकण्याची व काम करण्याची तयारी', hi: 'शीघ्र सीखने की तत्परता', en: 'Fast Learner / Adaptable' } },
      { id: 'customer_assistance', names: { mr: 'ग्राहक मदत व प्रत्यक्ष काम', hi: 'ग्राहक सहायता एवं प्रत्यक्ष कार्य', en: 'Direct Customer / Operational Assistance' } }
    ]
  }
];

export const ALL_SKILL_IDS = REGIONAL_TRADES.flatMap(t => t.skills.map(s => s.id));

export function getSkillName(skillId: string, locale: 'mr' | 'hi' | 'en' = 'mr'): string {
  for (const trade of REGIONAL_TRADES) {
    const found = trade.skills.find(s => s.id === skillId);
    if (found) {
      return found.names[locale] || found.names.en;
    }
  }
  // Humanize custom open-ended skills
  if (skillId.includes('_')) {
    return skillId
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return skillId;
}

export function getTradeName(tradeId: string, locale: 'mr' | 'hi' | 'en' = 'mr'): string {
  const trade = REGIONAL_TRADES.find(t => t.id === tradeId);
  if (trade) {
    return trade.names[locale] || trade.names.en;
  }
  // Humanize custom open-ended trade
  if (tradeId.includes('_')) {
    return tradeId
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return tradeId;
}

/**
 * Universal Open-Ended Trade and Skill Extractor
 * Guarantees that ANY job (farming, dairy, tailoring, salon, mobile repair, catering, or thousands of informal vocations)
 * is cleanly extracted, never dropped into an ambiguous bucket, and structured with relevant skill tokens.
 */
export function extractOpenEndedProfile(rawText: string, defaultName = 'Candidate') {
  const lower = rawText.toLowerCase();

  // 1. Check known categories
  let detectedTrade = '';
  let customTradeTitle = '';

  if (lower.includes('dairy') || lower.includes('डेअरी') || lower.includes('दूध') || lower.includes('कृषी') || lower.includes('शेती') || lower.includes('पशु')) {
    detectedTrade = 'agriculture_dairy';
  } else if (lower.includes('टेलर') || lower.includes('tailor') || lower.includes('शिलाई') || lower.includes('ब्लाऊज') || lower.includes('कपडे') || lower.includes('बुटीक')) {
    detectedTrade = 'tailoring_fashion';
  } else if (lower.includes('ब्युटी') || lower.includes('beauty') || lower.includes('पार्लर') || lower.includes('parlour') || lower.includes('सलून') || lower.includes('salon') || lower.includes('मेकअप')) {
    detectedTrade = 'beauty_wellness';
  } else if (lower.includes('मोबाईल') || lower.includes('mobile') || lower.includes('इलेक्ट्रॉनिक') || lower.includes('स्क्रीन') || lower.includes('soledering') || lower.includes('सोल्डरिंग')) {
    detectedTrade = 'electronics_repair';
  } else if (lower.includes('सोलर') || lower.includes('solar') || lower.includes('इन्व्हर्टर') || lower.includes('inverter') || lower.includes('रूफटॉप')) {
    detectedTrade = 'solar_renewable';
  } else if (lower.includes('खानावळ') || lower.includes('केटरिंग') || lower.includes('catering') || lower.includes('हलवाई') || lower.includes('मिठाई') || lower.includes('मेस') || lower.includes('tiffin')) {
    detectedTrade = 'food_catering';
  } else if (lower.includes('dtp') || lower.includes('डीटीपी') || lower.includes('फ्लेक्स') || lower.includes('flex') || lower.includes('प्रिंटिंग') || lower.includes('झेरॉक्स')) {
    detectedTrade = 'printing_media';
  } else if (lower.includes('रिक्षा') || lower.includes('rickshaw') || lower.includes('ऑटो') || lower.includes('चालक') || lower.includes('ड्रायव्हर') || lower.includes('driver') || lower.includes('कॅब')) {
    detectedTrade = 'transport_fleet';
  } else if (lower.includes('weld') || lower.includes('वेल्डर') || lower.includes('welding') || lower.includes('फॅब्रिकेशन')) {
    detectedTrade = 'welder';
  } else if (lower.includes('fitter') || lower.includes('फिटर') || lower.includes('turner') || lower.includes('टर्नर') || lower.includes('cnc') || lower.includes('lathe')) {
    detectedTrade = 'fitter_turner';
  } else if (lower.includes('wireman') || lower.includes('वायरमन') || lower.includes('electric') || lower.includes('इलेक्ट्रिशियन') || lower.includes('wiring')) {
    detectedTrade = 'electrician';
  } else if (lower.includes('diesel') || lower.includes('mechanic') || lower.includes('मेकॅनिक') || lower.includes('गाडी') || lower.includes('सर्व्हिसिंग')) {
    detectedTrade = 'mechanic';
  } else if (lower.includes('plumb') || lower.includes('प्लंबर') || lower.includes('पाईप') || lower.includes('pipe')) {
    detectedTrade = 'plumber';
  } else if (lower.includes('computer') || lower.includes('कॉम्प्युटर') || lower.includes('संगणक') || lower.includes('tally') || lower.includes('टॅली') || lower.includes('billing') || lower.includes('data entry')) {
    detectedTrade = 'computer_operator';
  } else if (lower.includes('sales') || lower.includes('सेल्स') || lower.includes('दुकान') || lower.includes('cashier') || lower.includes('कॅशियर') || lower.includes('काउंटर')) {
    detectedTrade = 'retail_sales';
  } else if (lower.includes('warehouse') || lower.includes('वेअरहाऊस') || lower.includes('packing') || lower.includes('पॅकिंग') || lower.includes('डिसपॅच')) {
    detectedTrade = 'logistics_warehouse';
  } else if (lower.includes('hotel') || lower.includes('हॉटेल') || lower.includes('cook') || lower.includes('कुक') || lower.includes('स्वयंपाक')) {
    detectedTrade = 'hospitality_support';
  } else if (lower.includes('hospital') || lower.includes('रुग्णालय') || lower.includes('clinic') || lower.includes('nurse') || lower.includes('ward')) {
    detectedTrade = 'healthcare_assistant';
  } else if (lower.includes('security') || lower.includes('सुरक्षा') || lower.includes('guard') || lower.includes('गार्ड') || lower.includes('चौकीदार')) {
    detectedTrade = 'security_facilities';
  } else if (lower.includes('mason') || lower.includes('गवंडी') || lower.includes('बांधकाम') || lower.includes('painter') || lower.includes('रंगकाम') || lower.includes('सुतार')) {
    detectedTrade = 'construction_masonry';
  }

  // 2. Open-Ended Fallback: If not matched, extract candidate's exact vocational phrase
  if (!detectedTrade) {
    // Check speech/text linguistic phrases
    const vocationMatch = rawText.match(/(?:मी|माझा|माझे|I work as a?|I am an?|मेरा काम|मैं)\s+([A-Za-z\u0900-\u097F\s\-]{3,35}?)(?:चे काम|चा व्यवसाय|चालवतो|करतो|चा अनुभव|specialist|technician|operator|worker|,|\.|$)/i);
    if (vocationMatch && vocationMatch[1] && vocationMatch[1].trim().length > 2) {
      customTradeTitle = vocationMatch[1].trim();
      detectedTrade = customTradeTitle
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/g, '_')
        .replace(/^_+|_+$/g, '');
    } else {
      detectedTrade = 'general_flexible';
    }
  }

  // 3. Taluka extraction across Vidarbha
  let taluka = 'Nagpur Urban';
  if (lower.includes('butibori') || lower.includes('बुटीबोरी')) taluka = 'Butibori';
  else if (lower.includes('hingna') || lower.includes('हिंगणा')) taluka = 'Hingna';
  else if (lower.includes('umred') || lower.includes('उमरेड')) taluka = 'Umred';
  else if (lower.includes('katol') || lower.includes('काटोल')) taluka = 'Katol';
  else if (lower.includes('saoner') || lower.includes('सावनेर')) taluka = 'Saoner';
  else if (lower.includes('kalmeshwar') || lower.includes('कलमेश्वर')) taluka = 'Kalmeshwar';
  else if (lower.includes('kamptee') || lower.includes('कामठी')) taluka = 'Kamptee';
  else if (lower.includes('wardha') || lower.includes('वर्धा')) taluka = 'Wardha';
  else if (lower.includes('chandrapur') || lower.includes('चंद्रपूर')) taluka = 'Chandrapur';
  else if (lower.includes('amravati') || lower.includes('अमरावती')) taluka = 'Amravati';
  else if (lower.includes('bhandara') || lower.includes('भंडारा')) taluka = 'Bhandara';
  else if (lower.includes('gondia') || lower.includes('गोंदिया')) taluka = 'Gondia';

  // 4. Skills extraction: match standard skills or synthesize custom tokens
  const detectedSkills: string[] = [];
  
  // Cross-domain skill matching
  if (lower.includes('wiring') || lower.includes('वायरिंग')) detectedSkills.push('house_wiring');
  if (lower.includes('panel') || lower.includes('पॅनल')) detectedSkills.push('industrial_panel');
  if (lower.includes('motor') || lower.includes('रिवाइंडिंग')) detectedSkills.push('motor_rewinding');
  if (lower.includes('arc') || lower.includes('आर्क')) detectedSkills.push('arc_welding');
  if (lower.includes('mig') || lower.includes('एमआयजी')) detectedSkills.push('mig_welding');
  if (lower.includes('cnc') || lower.includes('सीएनसी')) detectedSkills.push('cnc_operation');
  if (lower.includes('lathe') || lower.includes('लेथ')) detectedSkills.push('lathe_operation');
  if (lower.includes('pipe') || lower.includes('पाईप')) detectedSkills.push('pvc_gi_pipe_fitting');
  if (lower.includes('दूध') || lower.includes('milk') || lower.includes('dairy')) detectedSkills.push('dairy_milk_collection');
  if (lower.includes('शेत') || lower.includes('ट्रॅक्टर') || lower.includes('tractor')) detectedSkills.push('tractor_farming_equipment');
  if (lower.includes('शिलाई') || lower.includes('tailor') || lower.includes('stitching')) detectedSkills.push('garment_stitching_tailoring');
  if (lower.includes('ब्लाऊज') || lower.includes('कटिंग') || lower.includes('pattern')) detectedSkills.push('blouse_dress_pattern_cutting');
  if (lower.includes('मेकअप') || lower.includes('facial') || lower.includes('पार्लर')) detectedSkills.push('beauty_parlour_services');
  if (lower.includes('मोबाईल') || lower.includes('screen') || lower.includes('दुरुस्ती')) detectedSkills.push('mobile_hardware_repair');
  if (lower.includes('सोल्डरिंग') || lower.includes('soldering') || lower.includes('chip')) detectedSkills.push('chip_level_soldering');
  if (lower.includes('सोलर') || lower.includes('solar') || lower.includes('रूफटॉप')) detectedSkills.push('solar_panel_installation');
  if (lower.includes('इन्व्हर्टर') || lower.includes('inverter') || lower.includes('battery')) detectedSkills.push('inverter_battery_wiring');
  if (lower.includes('tally') || lower.includes('टॅली') || lower.includes('excel')) detectedSkills.push('ms_excel_tally');
  if (lower.includes('billing') || lower.includes('बिलिंग')) detectedSkills.push('billing_inventory_entry');
  if (lower.includes('sales') || lower.includes('विक्री') || lower.includes('काउंटर')) detectedSkills.push('counter_sales');
  if (lower.includes('ऑटो') || lower.includes('रिक्षा') || lower.includes('driver')) detectedSkills.push('auto_commercial_driving');
  if (lower.includes('cook') || lower.includes('स्वयंपाक') || lower.includes('मेस')) detectedSkills.push('commercial_cooking');
  if (lower.includes('patient') || lower.includes('रुग्ण')) detectedSkills.push('patient_care');
  if (lower.includes('security') || lower.includes('गार्ड') || lower.includes('सुरक्षा')) detectedSkills.push('gate_security');

  // If no standard skill tokens triggered, synthesize from trade
  if (detectedSkills.length === 0) {
    const tradeDef = REGIONAL_TRADES.find(t => t.id === detectedTrade);
    if (tradeDef && tradeDef.skills.length > 0) {
      detectedSkills.push(...tradeDef.skills.slice(0, 2).map(s => s.id));
    } else if (customTradeTitle) {
      detectedSkills.push(
        `${detectedTrade}_specialist`,
        'customer_assistance',
        'practical_execution'
      );
    } else {
      detectedSkills.push('general_helper', 'quick_learner');
    }
  }

  // 5. Experience extraction
  let experienceMonths = 12;
  const expMatch = rawText.match(/(\d+)\s*(?:वर्ष|year|साल|महिने|months?)/i);
  if (expMatch && expMatch[1]) {
    const num = parseInt(expMatch[1], 10);
    experienceMonths = /महिने|months?/i.test(expMatch[0]) ? num : num * 12;
  }

  // 6. Name extraction
  let candidateName = defaultName;
  const nameMatch = rawText.match(/(?:मी|माझं नाव|मेरा नाम|I am|Name is)\s+([A-Za-z\u0900-\u097F\s]{2,25}?)(?:,|\.|\s+नागपूर|\s+राहतो|\s+येथे|$)/i);
  if (nameMatch && nameMatch[1]) {
    candidateName = nameMatch[1].trim();
  }

  return {
    detectedTrade,
    customTradeTitle: customTradeTitle || getTradeName(detectedTrade, 'en'),
    taluka,
    detectedSkills,
    experienceMonths,
    candidateName
  };
}
