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
