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
      hi: 'इलेक्ट्रीशियन / वायरमैन',
      en: 'Electrician / Wireman'
    },
    skills: [
      { id: 'house_wiring', names: { mr: 'घरगुती वायरिंग', hi: 'घरेलू वायरिंग', en: 'House Wiring' } },
      { id: 'industrial_panel', names: { mr: 'इंडस्ट्रियल पॅनल असेंब्ली', hi: 'औद्योगिक पैनल असेंबली', en: 'Industrial Panel Assembly' } },
      { id: 'motor_rewinding', names: { mr: 'मोटर रिवायंडिंग', hi: 'मोटर रिवाइंडिंग', en: 'Motor Rewinding' } },
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
    id: 'logistics_warehouse',
    names: {
      mr: 'वेअरहाऊस / पॅकिंग / ड्रायव्हिंग',
      hi: 'वेयरहाउस / पैकिंग / ड्राइविंग',
      en: 'Warehouse / Packing / Driving'
    },
    skills: [
      { id: 'forklift_driving', names: { mr: 'फोर्कलिफ्ट ड्रायव्हिंग', hi: 'फोर्कलिफ्ट ड्राइविंग', en: 'Forklift Driving' } },
      { id: 'inventory_sorting', names: { mr: 'मालाची वर्गवारी व बारकोड स्कॅनिंग', hi: 'इन्वेंट्री सॉर्टिंग', en: 'Inventory Sorting & Scanning' } },
      { id: 'heavy_vehicle_driving', names: { mr: 'जड वाहन चालक (HGV परवाना)', hi: 'भारी वाहन चालक', en: 'Heavy Vehicle Driving' } },
      { id: 'dispatch_packing', names: { mr: 'डिस्पॅच पॅकिंग', hi: 'डिस्पैच पैकिंग', en: 'Dispatch & Packing' } }
    ]
  },
  {
    id: 'computer_operator',
    names: {
      mr: 'डेटा एंट्री / कॉम्प्युटर ऑपरेटर',
      hi: 'डेटा एंट्री / कंप्यूटर ऑपरेटर',
      en: 'Data Entry / Computer Operator'
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
      mr: 'हॉटेल / केटरिंग / कुक / कार्यालय सहाय्यक',
      hi: 'होटल / कैटरिंग / कुक / ऑफिस सहायक',
      en: 'Hospitality / Cooking / Office Assistant'
    },
    skills: [
      { id: 'commercial_cooking', names: { mr: 'व्यावसायिक स्वयंपाक व अन्न तयारी', hi: 'वाणिज्यिक कुकिंग एवं खान-पान', en: 'Commercial Cooking & Food Prep' } },
      { id: 'office_pantry_support', names: { mr: 'कार्यालय व पॅन्ट्री सहाय्य', hi: 'कार्यालय एवं पैंट्री सहयोग', en: 'Office & Pantry Support' } },
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
      en: 'Any General Work / Custom Role'
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
  return skillId;
}

export function getTradeName(tradeId: string, locale: 'mr' | 'hi' | 'en' = 'mr'): string {
  const trade = REGIONAL_TRADES.find(t => t.id === tradeId);
  if (trade) {
    return trade.names[locale] || trade.names.en;
  }
  return tradeId;
}
