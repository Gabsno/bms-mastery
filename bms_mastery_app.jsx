import { useState, useEffect, useRef } from 'react';
import { Flame, Trophy, Zap, BookOpen, Sparkles, ChevronRight, Check, X, RotateCcw, Send, ArrowLeft, Sliders, Brain, Target, Coffee } from 'lucide-react';

// ============================================================================
// LESSON CONTENT — Module 1: Foundations (first 10 lessons fully written)
// ============================================================================

const LESSONS = [
  {
    id: 'L1',
    module: 'Foundations',
    moduleNum: 1,
    title: 'What is a BMS, really?',
    duration: 6,
    hook: "A 30-story office tower in Accra runs ~$80,000 of electricity a month. The BMS is the silent system deciding when the chillers run, how fast pumps spin, and whether the lights dim at 6pm. Get it wrong and you burn money. Get it right and you have a quiet, comfortable, efficient building no one notices.",
    content: [
      { type: 'h3', text: 'Three terms, often confused' },
      { type: 'p', text: 'You will hear BMS, BAS, and SCADA used interchangeably. They are not quite the same.' },
      { type: 'bullets', items: [
        '**BMS (Building Management System)** — the umbrella term, common in UK/EU/Africa. Covers HVAC, lighting, metering, sometimes security and fire.',
        '**BAS (Building Automation System)** — the US-preferred term. Functionally identical to BMS in most usage.',
        '**SCADA (Supervisory Control and Data Acquisition)** — industrial cousin. Same architecture, but applied to factories, water plants, oil & gas. BMS is essentially SCADA for buildings.',
      ]},
      { type: 'h3', text: 'What a BMS actually does' },
      { type: 'p', text: 'A BMS is a distributed network of controllers, sensors, and actuators that monitors and adjusts a building\'s mechanical and electrical systems in real time. It exists to deliver four outcomes:' },
      { type: 'bullets', items: [
        '**Comfort** — temperature, humidity, fresh air, lighting at the right level',
        '**Efficiency** — minimum energy use to deliver the comfort',
        '**Safety** — smoke control, freeze protection, leak detection',
        '**Compliance** — logs, trends, alarms for audits and regulations',
      ]},
      { type: 'callout', text: 'The MEP engineer designs the systems. The BMS engineer makes them behave intelligently. Without the BMS, you have a Ferrari engine being driven by someone with no steering wheel.' },
    ],
    quiz: [
      {
        q: 'Which statement best describes the relationship between BMS and BAS?',
        options: ['BMS controls hardware, BAS controls software', 'They are essentially the same thing, with regional naming differences', 'BAS is older technology that BMS replaced', 'BMS only does HVAC, BAS does everything'],
        correct: 1,
      },
      {
        q: 'Which of these is NOT one of the four core outcomes a BMS exists to deliver?',
        options: ['Comfort', 'Efficiency', 'Aesthetic design', 'Compliance'],
        correct: 2,
      },
      {
        q: 'A BMS is most architecturally similar to which industrial system?',
        options: ['ERP', 'CRM', 'SCADA', 'PLM'],
        correct: 2,
      },
    ],
    takeaway: 'A BMS is the intelligence layer that makes a building\'s MEP systems behave with purpose — for comfort, efficiency, safety, and compliance.',
  },
  {
    id: 'L2',
    module: 'Foundations',
    moduleNum: 1,
    title: 'The 3-tier architecture',
    duration: 8,
    hook: "Every BMS on Earth — from a $5k clinic system to a $5M airport stack — follows the same three-tier shape. Once you see it, you can walk into any building and instantly know where to look for what.",
    content: [
      { type: 'h3', text: 'The three tiers' },
      { type: 'p', text: 'BMS architecture is always pyramidal. Bottom tier is many, top tier is few.' },
      { type: 'diagram', kind: 'tiers' },
      { type: 'h3', text: 'Tier 1 — Field layer' },
      { type: 'p', text: 'The "hands and eyes." Hundreds or thousands of devices physically attached to your HVAC equipment.' },
      { type: 'bullets', items: [
        'Sensors — temperature, humidity, pressure, CO2, flow, occupancy',
        'Actuators — valve actuators, damper actuators, VFDs',
        'Meters — power, water, gas, BTU',
        'These devices speak simple signals: 0–10V, 4–20mA, dry contacts',
      ]},
      { type: 'h3', text: 'Tier 2 — Automation layer' },
      { type: 'p', text: 'The "brains in the field." DDC controllers that run sequences of operation locally.' },
      { type: 'bullets', items: [
        'Application-Specific Controllers (ASCs) — for VAVs, FCUs, small fixed-function devices',
        'Field controllers / B-BCs — programmable, run AHUs, chillers, plant rooms',
        'They execute PID loops, schedules, and interlocks autonomously',
        'Critical: if the supervisor crashes, this tier keeps the building running',
      ]},
      { type: 'h3', text: 'Tier 3 — Management/Supervisory layer' },
      { type: 'p', text: 'The "control room." Servers and workstations where humans interact with the system.' },
      { type: 'bullets', items: [
        'Graphical dashboards showing plant status',
        'Schedules and setpoint management',
        'Alarms and event routing (email, SMS)',
        'Trend logs and energy reports',
        'Remote access for FM teams',
      ]},
      { type: 'callout', text: 'Rule of thumb: tier 1 = thousands of points, tier 2 = tens of controllers, tier 3 = one or two servers. Money flows the opposite direction — tier 3 software licenses are often the most expensive single line item.' },
    ],
    quiz: [
      {
        q: 'A pressure sensor wired to a JACE controller via BACnet MS/TP belongs to which tier?',
        options: ['Field layer (Tier 1)', 'Automation layer (Tier 2)', 'Supervisory layer (Tier 3)', 'It spans Tier 1 and Tier 2'],
        correct: 0,
      },
      {
        q: 'If the supervisory server crashes, what happens to control of the AHU?',
        options: ['AHU shuts down', 'AHU continues running its sequence from the field controller', 'Building enters fire mode', 'Sensors stop sending data'],
        correct: 1,
      },
      {
        q: 'A Niagara JACE 8000 is best described as a:',
        options: ['Field sensor', 'Field controller / supervisor hybrid', 'Pure cloud service', 'Type of actuator'],
        correct: 1,
      },
    ],
    takeaway: 'BMS is a 3-tier pyramid: many sensors/actuators (field), fewer controllers (automation), one or two supervisors. The middle tier keeps the building alive if the top tier dies.',
  },
  {
    id: 'L3',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Why BMS exists — the business case',
    duration: 5,
    hook: "Selling BMS is hard because clients see it as a cost, not an asset. Knowing the four arguments cold is the difference between winning the scope and losing it to the lowest-bid 'we'll just put a thermostat on it' contractor.",
    content: [
      { type: 'h3', text: 'The four business cases' },
      { type: 'p', text: 'Every BMS scope you ever pitch will land on one or more of these. Memorize them.' },
      { type: 'bullets', items: [
        '**Energy savings** — a properly commissioned BMS typically saves 15–30% on HVAC energy versus no controls. In Ghana, with ECG tariffs at ~GHS 2.5/kWh for commercial, this is real money fast.',
        '**Comfort and tenant satisfaction** — fewer hot/cold complaints, better IAQ, more productive staff. Hard to measure but devastating when missing.',
        '**Operational efficiency** — FM team monitors and adjusts remotely; preventive maintenance via trend analysis; faster fault diagnosis.',
        '**Compliance and reporting** — energy audits, sustainability ratings (EDGE, LEED), regulatory disclosure. Increasingly important even in Ghana.',
      ]},
      { type: 'h3', text: 'The Ghana-specific case' },
      { type: 'bullets', items: [
        'Power tariff structure rewards demand management (peak shaving)',
        'Diesel generator costs make every kWh of grid power saved worth more',
        'Heat and humidity make HVAC the dominant energy load — BMS impact is huge',
        'Skilled FM labor is scarce — remote monitoring multiplies one good engineer',
      ]},
      { type: 'callout', text: 'Pitch tip: lead with energy savings (concrete numbers), close with operational efficiency (peace of mind). Comfort and compliance are bonuses that don\'t sell on their own.' },
    ],
    quiz: [
      {
        q: 'Typical HVAC energy savings from a properly commissioned BMS is:',
        options: ['1–5%', '15–30%', '50–70%', '90%+'],
        correct: 1,
      },
      {
        q: 'Which business case is usually the strongest opener when selling BMS scope?',
        options: ['Aesthetic appeal of dashboards', 'Energy savings with concrete numbers', 'Compliance requirements', 'It makes the building look modern'],
        correct: 1,
      },
    ],
    takeaway: 'Four reasons BMS exists: energy savings, comfort, operational efficiency, compliance. Lead pitches with energy, close with operations.',
  },
  {
    id: 'L4',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Open vs closed loop control',
    duration: 7,
    hook: "Your bathroom shower mixer is closed-loop control. Your kettle is open-loop. The difference between these two ideas explains 80% of why BMS systems fail.",
    content: [
      { type: 'h3', text: 'Open loop' },
      { type: 'p', text: 'Open loop control means: you send a command, and trust it produced the desired result. There is no feedback.' },
      { type: 'p', text: 'Example: a kettle. You press "on" for 3 minutes. You trust the water is hot. The kettle does not measure water temperature — it just heats.' },
      { type: 'p', text: 'In BMS: a damper actuator told to drive to 50% open. We assume it got there. No position feedback.' },
      { type: 'h3', text: 'Closed loop' },
      { type: 'p', text: 'Closed loop means: you measure the result, compare to your goal, adjust until they match. The "loop" is sensor → controller → actuator → process → back to sensor.' },
      { type: 'p', text: 'Example: a shower mixer with a thermostat. You set 38°C. The mixer measures water temperature continuously and adjusts the hot/cold blend to hold 38°C even when someone flushes a toilet upstream.' },
      { type: 'p', text: 'In BMS: an AHU supply air sensor reads 16°C, setpoint is 13°C, controller opens the chilled water valve more. Sensor reads 13°C, valve modulates to hold position.' },
      { type: 'h3', text: 'Vocabulary you must know cold' },
      { type: 'bullets', items: [
        '**Setpoint (SP)** — the goal value (e.g. 13°C supply air)',
        '**Process variable (PV)** — what you actually measure (e.g. 16°C actual)',
        '**Error** — the difference (SP − PV = 3°C in this case)',
        '**Control output (CO)** — what the controller drives in response (e.g. valve at 67% open)',
      ]},
      { type: 'callout', text: 'Almost every "BMS not working" complaint is really a closed-loop problem: sensor drifted, valve stuck, controller tuning wrong, or the loop was never properly closed in the first place. Train your ear for "sensor / setpoint / output" — if you can\'t name all three, you can\'t fix the problem.' },
    ],
    quiz: [
      {
        q: 'A motorized damper actuator with no position feedback being driven to 70% is an example of:',
        options: ['Open loop', 'Closed loop', 'Cascade loop', 'Feedforward'],
        correct: 0,
      },
      {
        q: 'In the equation Error = Setpoint − Process Variable, if SP is 22°C and PV is 24°C, the error is:',
        options: ['+2°C (heating needed)', '−2°C (cooling needed)', '0°C (at setpoint)', 'Cannot be determined'],
        correct: 1,
      },
      {
        q: 'Which of these is closed loop?',
        options: ['A timer-based exhaust fan running 8am–6pm', 'A space temperature sensor adjusting a VAV damper to hold 22°C', 'A light switch', 'A pump set to constant speed'],
        correct: 1,
      },
    ],
    takeaway: 'Closed loop = measure, compare, adjust. Open loop = command and pray. Almost all BMS control is (and should be) closed loop.',
  },
  {
    id: 'L5',
    module: 'Foundations',
    moduleNum: 1,
    title: 'PID control, intuitively',
    duration: 10,
    hook: "PID is the single most important algorithm in your entire BMS career. Every modulating loop — every valve, every damper, every VFD — uses PID. The math looks scary; the intuition is dead simple.",
    content: [
      { type: 'h3', text: 'The three terms' },
      { type: 'p', text: 'PID = Proportional + Integral + Derivative. Three responses to error, added together.' },
      { type: 'bullets', items: [
        '**P (Proportional)** — react to *how big* the error is right now',
        '**I (Integral)** — react to *how long* the error has persisted',
        '**D (Derivative)** — react to *how fast* the error is changing',
      ]},
      { type: 'h3', text: 'The driving analogy' },
      { type: 'p', text: 'You\'re driving toward a stop line.' },
      { type: 'bullets', items: [
        '**P alone:** the further from the line, the harder you brake. But near the line, you brake softly — you might roll past it and never settle exactly on it. This leftover gap is called *offset*.',
        '**I added:** "I\'ve been 1 meter short for 5 seconds — that\'s unacceptable, push the brake harder until I\'m exactly on the line." I eliminates offset over time.',
        '**D added:** "I\'m approaching the line fast — ease off the brake before I overshoot." D dampens overshoot and oscillation.',
      ]},
      { type: 'h3', text: 'In BMS terms' },
      { type: 'p', text: 'Supply air setpoint is 13°C. Current temp is 18°C.' },
      { type: 'bullets', items: [
        '**P kicks in:** big error (5°C) → drive valve mostly open',
        '**As temp drops to 14°C:** P alone would leave valve nearly closed, leaving a 1°C offset',
        '**I builds up:** "we\'ve been 1°C off for 30 seconds" → push valve a bit more open until error = 0',
        '**D watches the rate:** if temp is crashing down fast (overshoot risk), pull the valve back a bit',
      ]},
      { type: 'h3', text: 'Tuning in plain language' },
      { type: 'bullets', items: [
        'Loop too slow / lazy → increase P',
        'Loop never quite hits setpoint → add or increase I',
        'Loop overshoots and oscillates → reduce P, or add a touch of D',
        'Loop is noisy / jittery → reduce D (D amplifies sensor noise)',
      ]},
      { type: 'callout', text: 'Most field engineers tune PID by feel after seeing 50+ loops behave. You\'ll get there. For now: 90% of HVAC loops work fine with P-only or PI. D is rarely needed and often causes more problems than it solves.' },
      { type: 'p', text: '**Try it now → open the PID Lab from the home screen.** Drag P, I, D sliders and watch a real loop respond. Nothing builds intuition faster.' },
    ],
    quiz: [
      {
        q: 'A control loop reaches steady state with a persistent 2°C error below setpoint. Which term most directly addresses this?',
        options: ['P (Proportional)', 'I (Integral)', 'D (Derivative)', 'Add a deadband'],
        correct: 1,
      },
      {
        q: 'A PID loop is oscillating — supply air swings between 11°C and 15°C every minute. First action?',
        options: ['Increase P', 'Decrease P', 'Increase D significantly', 'Switch to on/off control'],
        correct: 1,
      },
      {
        q: 'D term is generally avoided in HVAC because:',
        options: ['It is patented', 'It amplifies sensor noise and HVAC processes are slow', 'It requires more memory', 'It doesn\'t work below 0°C'],
        correct: 1,
      },
    ],
    takeaway: 'PID = react to size (P), duration (I), and rate (D) of error. Most HVAC loops only need P or PI. D usually causes more trouble than it solves.',
  },
  {
    id: 'L6',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Signals — analog vs digital I/O',
    duration: 6,
    hook: "Every wire that leaves a BMS controller is one of four signal types. Knowing them cold lets you read any panel drawing and instantly understand what every terminal does.",
    content: [
      { type: 'h3', text: 'The four signal families' },
      { type: 'bullets', items: [
        '**AI (Analog Input)** — reads a continuous value. Temperature, pressure, humidity sensors.',
        '**AO (Analog Output)** — sends a continuous value. Modulating valves, dampers, VFD speed.',
        '**DI (Digital Input)** — reads on/off. Status feedback, alarms, dry contacts.',
        '**DO (Digital Output)** — sends on/off. Relay outputs to start/stop motors, energize coils.',
      ]},
      { type: 'h3', text: 'Common signal standards' },
      { type: 'bullets', items: [
        '**0–10V DC** — most common AI/AO standard. 0V = 0%, 10V = 100%. Cheap, distance-limited.',
        '**4–20mA** — industrial AI standard. More noise-immune, longer distances. The "4" baseline means a broken wire reads 0mA, instantly detectable.',
        '**RTD (PT100, PT1000)** — temperature sensing via resistance. Very accurate.',
        '**Thermistor (10kΩ NTC, 20kΩ NTC)** — cheaper temperature sensing, less accurate but fine for HVAC.',
        '**Dry contact** — just a switch closure for DI. No voltage from the field device.',
        '**Pulse** — counted DI for meters (1 pulse = X kWh or X liters).',
      ]},
      { type: 'h3', text: 'Quick read of a controller I/O sheet' },
      { type: 'p', text: 'A typical small AHU controller might have: 6 AI, 4 AO, 6 DI, 4 DO. That means it can read 6 sensors, drive 4 modulating outputs, read 6 status signals, and switch 4 relays. Sizing means counting these for your application + adding spare capacity (typically 20%).' },
      { type: 'callout', text: 'In Ghana, 4–20mA pays off — long sensor runs, electrical noise, and humidity make 0–10V signals drift more than spec sheets suggest. Worth the small cost premium on critical points.' },
    ],
    quiz: [
      {
        q: 'A modulating chilled water valve being driven from a controller is connected to which I/O type?',
        options: ['AI', 'AO', 'DI', 'DO'],
        correct: 1,
      },
      {
        q: 'A pump "run status" signal (auxiliary contact from the starter) connects to which I/O type?',
        options: ['AI', 'AO', 'DI', 'DO'],
        correct: 2,
      },
      {
        q: 'Main advantage of 4–20mA over 0–10V:',
        options: ['Faster response', 'Wire break detection (reads 0mA) and noise immunity', 'Cheaper sensors', 'Works underwater'],
        correct: 1,
      },
    ],
    takeaway: 'Four signal types: AI (read continuous), AO (drive continuous), DI (read on/off), DO (switch on/off). Standards: 0–10V, 4–20mA, RTD/thermistor, dry contacts, pulse.',
  },
  {
    id: 'L7',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Why BACnet won the protocol wars',
    duration: 7,
    hook: "Before BACnet existed, every vendor locked you in. Buy Trane chillers? You needed Trane controllers, Trane software, Trane technicians, Trane forever. BACnet broke that cartel and is now in 95% of commercial buildings worldwide.",
    content: [
      { type: 'h3', text: 'The pre-BACnet dark ages' },
      { type: 'p', text: 'Through the 1980s, every major HVAC manufacturer had a proprietary protocol. Trane spoke Trane. Honeywell spoke Honeywell. Mixing brands was nearly impossible without expensive gateways. Building owners were captives.' },
      { type: 'h3', text: 'BACnet is born' },
      { type: 'p', text: 'In 1995, ASHRAE released BACnet (Building Automation and Control networks) as an open standard. It defined a universal language: how devices describe themselves, what objects they expose, how to read/write data, how to discover each other on a network.' },
      { type: 'h3', text: 'Why it won' },
      { type: 'bullets', items: [
        '**Open standard** — no licensing fees, anyone can implement it',
        '**Object-oriented** — devices expose standard "objects" (Analog Input, Schedule, etc.) any other device can understand',
        '**Network-flexible** — runs on Ethernet (BACnet/IP) or RS-485 (BACnet MS/TP) or other media',
        '**Backed by ASHRAE** — the trusted industry body forced consensus',
        '**Building-specific** — unlike Modbus (industrial), BACnet was designed for HVAC scenarios',
      ]},
      { type: 'h3', text: 'BACnet today' },
      { type: 'bullets', items: [
        'Required by spec on virtually all commercial projects globally',
        'Two physical layers dominate: BACnet/IP (Ethernet) for backbones, BACnet MS/TP (RS-485) for field buses',
        'BACnet/SC (Secure Connect) is the new secure variant, slowly rolling out',
        'Native in every major BMS vendor: Siemens, JCI, Honeywell, Schneider, Trane, Carrier, Distech, ALC, Delta',
      ]},
      { type: 'callout', text: 'When you spec BMS scope: always require "BACnet/IP native" for the supervisor and "BACnet MS/TP or IP native" for field controllers. Reject any bid that needs gateways or proprietary cards as primary integration — that\'s the lock-in trying to creep back in.' },
    ],
    quiz: [
      {
        q: 'BACnet was released by ASHRAE in:',
        options: ['1985', '1995', '2005', '2015'],
        correct: 1,
      },
      {
        q: 'BACnet MS/TP runs over which physical layer?',
        options: ['Ethernet', 'RS-485 twisted pair', 'Wi-Fi', 'Fiber optic only'],
        correct: 1,
      },
      {
        q: 'Why is "BACnet/IP native" preferred over "BACnet via gateway"?',
        options: ['It\'s faster', 'It avoids vendor lock-in and an extra point of failure', 'It\'s cheaper hardware', 'It\'s required by Ghana law'],
        correct: 1,
      },
    ],
    takeaway: 'BACnet is the universal open language of building automation. Spec it native. Anything else risks vendor lock-in.',
  },
  {
    id: 'L8',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Anatomy of a Sequence of Operation',
    duration: 9,
    hook: "The Sequence of Operation is the most important document in any BMS project. It's the contract between the designer (you) and the integrator (them) that defines exactly how the building should behave. A bad SOO causes 90% of commissioning fights.",
    content: [
      { type: 'h3', text: 'What an SOO is' },
      { type: 'p', text: 'A Sequence of Operation is a plain-language description of how each piece of equipment should be controlled under every condition: occupied, unoccupied, startup, shutdown, fire, fault, maintenance.' },
      { type: 'h3', text: 'The standard structure (ASHRAE Guideline 36)' },
      { type: 'bullets', items: [
        '**Equipment description** — what it is, what it serves',
        '**Modes of operation** — Occupied, Unoccupied, Setback, Warm-up, Cool-down, Test',
        '**Setpoints** — supply air temp, static pressure, OA flow, etc.',
        '**Control sequences** — for each mode, exactly what each component does',
        '**Safeties and interlocks** — freezestat, smoke, high static, low temp',
        '**Alarms** — what triggers an alarm, what priority',
        '**Failure modes** — what happens when sensor X fails or valve Y is stuck',
      ]},
      { type: 'h3', text: 'A mini SOO for an AHU' },
      { type: 'p', text: 'Just to feel the texture:' },
      { type: 'callout', text: 'Supply fan: starts when the schedule is Occupied OR when zone temperature exceeds setback. VFD modulates to maintain duct static pressure setpoint of 1.5 in. w.g. ± 0.1 in. w.g. Cooling valve: PID modulates 0–100% to maintain supply air temperature setpoint of 13°C ± 0.5°C. Economizer: enables when OAT < 18°C AND OAT < RAT − 2°C. On fire alarm: supply fan stops within 5 seconds, outside air damper closes, return air damper closes, exhaust damper opens.' },
      { type: 'h3', text: 'Why it matters commercially' },
      { type: 'bullets', items: [
        'A great SOO = predictable commissioning, no disputes, on-time handover',
        'A bad SOO = endless RFIs, blame games, late projects, unhappy clients',
        'Yakuver can charge a premium for SOO writing alone — it\'s a high-leverage service',
        'ASHRAE Guideline 36 is free online and gives you templates for everything',
      ]},
    ],
    quiz: [
      {
        q: 'An SOO that says "AHU controls supply air temperature appropriately" is:',
        options: ['Adequate — engineers know what that means', 'Inadequate — must specify setpoint, control element, and tolerances', 'A pricing strategy', 'Required only for chillers'],
        correct: 1,
      },
      {
        q: 'Which document is considered the gold standard reference for HVAC sequences?',
        options: ['ASHRAE 90.1', 'ASHRAE Guideline 36', 'IEEE 802.11', 'ISO 9001'],
        correct: 1,
      },
      {
        q: 'Best place to specify "what happens during a fire alarm" in BMS scope:',
        options: ['Verbal handover meeting', 'In the SOO under safeties/failure modes', 'On site during commissioning', 'In the cleaning manual'],
        correct: 1,
      },
    ],
    takeaway: 'The SOO is the contract. Write it precisely — modes, setpoints, sequences, safeties, alarms, failure modes — and your projects will commission cleanly.',
  },
  {
    id: 'L9',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Reading a point list',
    duration: 8,
    hook: "Every BMS project has a point list. It's a spreadsheet with hundreds of rows that tells you exactly what's being controlled, how, and with what hardware. If you can read one fluently, you can scope and price any BMS job.",
    content: [
      { type: 'h3', text: 'What a point list is' },
      { type: 'p', text: 'A point list (also called I/O schedule) is a row-per-signal inventory of every physical and software point in the BMS. Each row tells you: what equipment, what signal, what type, what device, what tag, what notes.' },
      { type: 'h3', text: 'Standard columns' },
      { type: 'bullets', items: [
        '**Equipment** — AHU-01, CH-02, VAV-3F-12',
        '**Description** — Supply Air Temperature, Cooling Valve Position',
        '**Tag / Point name** — AHU01.SAT, CH02.CHWVLV',
        '**Type** — AI, AO, DI, DO, AV, BV (BACnet virtual points)',
        '**Signal** — 0–10V, 4–20mA, PT1000, dry contact',
        '**Range / units** — 0–50°C, 0–100%',
        '**Field device** — sensor make/model, valve actuator',
        '**Controller** — which controller, which terminal',
        '**Notes** — alarm priority, history collection, network exposure',
      ]},
      { type: 'h3', text: 'A typical AHU point list — roughly 30 points' },
      { type: 'bullets', items: [
        'Supply air temp (AI), return air temp (AI), mixed air temp (AI), outside air temp (AI shared)',
        'Supply air humidity (AI), return air humidity (AI)',
        'Supply duct static pressure (AI), filter DP (AI or DI)',
        'Supply fan VFD speed (AO), VFD status (DI), VFD fault (DI), VFD speed feedback (AI)',
        'Return fan equivalent set',
        'Cooling valve (AO), heating valve (AO)',
        'OA damper (AO), RA damper (AO), EA damper (AO)',
        'Freezestat (DI), smoke detector (DI), high static safety (DI)',
        'Zone CO2 (AI), occupancy override (DI)',
        '...and software points: setpoints (AV), occupied state (BV), schedule, alarms',
      ]},
      { type: 'h3', text: 'Why this matters' },
      { type: 'bullets', items: [
        '**Pricing** — point count × $/point is the fastest BMS estimate method (rough order: $300–$800 per point in Ghana including hardware, software, install, commissioning)',
        '**Controller sizing** — sum your AI/AO/DI/DO counts and add 20% spare to pick controllers',
        '**Cable scheduling** — every point needs a cable; the list drives containment design',
        '**Commissioning checklist** — every row gets a "tested" tick mark during P2P',
      ]},
      { type: 'callout', text: 'Productize this: a clean, vendor-neutral point list template per equipment type (AHU, chiller, FCU, VRF, pump set, lighting circuit) is one of the most valuable IP assets a small MEP firm can own. Worth building for Yakuver, worth selling later.' },
    ],
    quiz: [
      {
        q: 'A supply duct static pressure transmitter reading 0–2 in. w.g. into a controller is:',
        options: ['AI', 'AO', 'DI', 'DO'],
        correct: 0,
      },
      {
        q: 'Rough Ghana-market BMS pricing per point (all-in: hardware, software, install, commissioning) is approximately:',
        options: ['$10–$50', '$300–$800', '$5,000–$10,000', '$50,000+'],
        correct: 1,
      },
      {
        q: 'When sizing a controller from a point list, you should:',
        options: ['Match I/O exactly to point count', 'Add ~20% spare I/O capacity', 'Pick the cheapest controller', 'Use one controller per point'],
        correct: 1,
      },
    ],
    takeaway: 'The point list is the BMS bible — drives pricing, controller sizing, cable scheduling, and Cx. Build great templates and you have an asset for life.',
  },
  {
    id: 'L10',
    module: 'Foundations',
    moduleNum: 1,
    title: 'Module 1 boss check',
    duration: 12,
    hook: "End of Module 1. Let's see if it stuck.",
    content: [
      { type: 'h3', text: 'Module 1 recap' },
      { type: 'p', text: 'You\'ve covered: what BMS is, the 3-tier architecture, the business case, open vs closed loop control, PID intuition, signals and I/O, why BACnet won, what an SOO is, and how to read a point list.' },
      { type: 'p', text: 'This boss check has 8 questions across all of Module 1. Pass at 75% (6/8) to unlock Module 2.' },
      { type: 'callout', text: 'If you fail, the app will spaced-repeat the wrong topics over the next 3 days before you re-attempt. That\'s by design — your brain encodes better after the failure.' },
    ],
    quiz: [
      {
        q: 'A field controller for an AHU loses its connection to the supervisor. What happens?',
        options: ['AHU stops', 'AHU keeps running its local sequence', 'Building enters fire mode', 'Alarms are deleted'],
        correct: 1,
      },
      {
        q: 'PID loop oscillates ±2°C around setpoint, period of ~3 minutes. Best first action:',
        options: ['Add deadband', 'Increase P (proportional gain)', 'Decrease P (proportional gain)', 'Increase D (derivative)'],
        correct: 2,
      },
      {
        q: 'A modulating damper actuator driven 0–10V from a controller is connected to:',
        options: ['AI', 'AO', 'DI', 'DO'],
        correct: 1,
      },
      {
        q: 'Which is NOT one of the four core BMS business cases?',
        options: ['Energy savings', 'Comfort and IAQ', 'Aesthetic dashboards for the lobby', 'Compliance and reporting'],
        correct: 2,
      },
      {
        q: 'You receive a bid that requires a proprietary gateway between the BMS supervisor and the chiller. Best response:',
        options: ['Accept — gateways are normal', 'Push back and require BACnet/IP native on the chiller', 'Cancel the project', 'Use Modbus only'],
        correct: 1,
      },
      {
        q: 'The Sequence of Operation should specify all of the following EXCEPT:',
        options: ['Setpoints and tolerances', 'Modes of operation', 'Failure modes and safeties', 'The exact brand of valves to use'],
        correct: 3,
      },
      {
        q: 'A point list for a typical commercial AHU contains approximately:',
        options: ['3–5 points', '30–40 points', '300–400 points', '3,000+ points'],
        correct: 1,
      },
      {
        q: 'BACnet/IP runs over UDP port:',
        options: ['80', '443', '47808', '8080'],
        correct: 2,
      },
    ],
    takeaway: 'Module 1 complete. Foundation laid. Module 2 (HVAC Controls Applied) is where your 8 years of HVAC experience starts paying massive dividends.',
    isBoss: true,
  },
];

// ============================================================================
// STORAGE — keep everything in localStorage so progress persists
// ============================================================================

const loadState = () => {
  try {
    const raw = localStorage.getItem('bms_mastery_v1');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
};
const saveState = (s) => {
  try { localStorage.setItem('bms_mastery_v1', JSON.stringify(s)); } catch {}
};

const initialState = () => loadState() || {
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessons: [],
  quizScores: {},
  flashcards: [],
  currentLesson: 'L1',
};

// ============================================================================
// PID SIMULATOR — the centerpiece interactive
// ============================================================================

function PIDSimulator({ onBack }) {
  const [p, setP] = useState(2.0);
  const [i, setI] = useState(0.3);
  const [d, setD] = useState(0.0);
  const [setpoint, setSetpoint] = useState(13);
  const [running, setRunning] = useState(true);
  const [disturbance, setDisturbance] = useState(false);
  const canvasRef = useRef(null);
  const stateRef = useRef({
    pv: 24,           // start at 24°C (hot day, AHU just kicked on)
    integral: 0,
    lastError: 0,
    output: 0,
    history: [],
    t: 0,
  });

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const s = stateRef.current;
      const error = setpoint - s.pv;
      s.integral += error * 0.5; // dt = 0.5s
      s.integral = Math.max(-50, Math.min(50, s.integral)); // anti-windup
      const deriv = (error - s.lastError) / 0.5;
      s.lastError = error;

      // PID output: 0 = valve closed (no cooling), 100 = valve open (max cooling)
      // Note error is negative when PV > SP (too hot), so output should be positive when error is negative
      let output = -(p * error + i * s.integral + d * deriv);
      output = Math.max(0, Math.min(100, output));
      s.output = output;

      // Process model: 1st-order lag. Valve cools, ambient warms.
      // dT/dt = -k_cool * (output/100) + k_warm
      const k_cool = 0.6; // cooling capacity coefficient
      const k_warm = disturbance ? 0.25 : 0.15; // ambient heat gain
      const dT = (-k_cool * (output / 100) + k_warm) * 0.5;
      s.pv += dT;
      // small sensor noise
      s.pv += (Math.random() - 0.5) * 0.05;

      s.t += 0.5;
      s.history.push({ t: s.t, pv: s.pv, sp: setpoint, output });
      if (s.history.length > 240) s.history.shift();

      drawChart();
    }, 100);
    return () => clearInterval(interval);
  }, [p, i, d, setpoint, running, disturbance]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // background grid
    ctx.strokeStyle = 'rgba(180, 200, 220, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += W / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += H / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const hist = stateRef.current.history;
    if (hist.length < 2) return;

    // y range 8°C to 30°C
    const yMin = 8, yMax = 30;
    const toX = (i) => (i / 240) * W;
    const toY = (v) => H - ((v - yMin) / (yMax - yMin)) * H;

    // setpoint line (dashed cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, toY(setpoint));
    ctx.lineTo(W, toY(setpoint));
    ctx.stroke();
    ctx.setLineDash([]);

    // PV line (orange)
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    hist.forEach((pt, idx) => {
      const x = toX(idx);
      const y = toY(pt.pv);
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // output line (faint green, scaled)
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    hist.forEach((pt, idx) => {
      const x = toX(idx);
      // Map 0-100 output to chart y range
      const y = H - (pt.output / 100) * H;
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`PV: ${stateRef.current.pv.toFixed(2)}°C`, 10, 20);
    ctx.fillText(`SP: ${setpoint.toFixed(1)}°C`, 10, 36);
    ctx.fillText(`Valve: ${stateRef.current.output.toFixed(1)}%`, 10, 52);
    ctx.fillText(`Error: ${(setpoint - stateRef.current.pv).toFixed(2)}°C`, 10, 68);
  };

  const reset = () => {
    stateRef.current = { pv: 24, integral: 0, lastError: 0, output: 0, history: [], t: 0 };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
        <ArrowLeft size={18} /> back
      </button>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sliders className="text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-tight">PID Lab</h1>
        </div>
        <p className="text-slate-400 mb-8">A simulated AHU cooling loop. Setpoint is the target supply air temperature. The valve modulates between 0% (no cooling) and 100% (max cooling). Watch how P, I, D affect the loop.</p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <canvas ref={canvasRef} width={920} height={320} className="w-full rounded-lg bg-slate-950" />
          <div className="flex gap-6 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-400"></span>Process Variable (temp)</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-cyan-400"></span>Setpoint</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-400/50"></span>Valve output</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Slider label="P (Proportional)" value={p} setValue={setP} min={0} max={10} step={0.1} hint="How hard to push proportional to current error" />
          <Slider label="I (Integral)" value={i} setValue={setI} min={0} max={2} step={0.05} hint="How hard to push for persistent error" />
          <Slider label="D (Derivative)" value={d} setValue={setD} min={0} max={3} step={0.05} hint="How hard to dampen fast changes" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Slider label="Setpoint" value={setpoint} setValue={setSetpoint} min={8} max={20} step={0.5} hint="Target supply air temperature" unit="°C" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-sm text-slate-400 mb-3">Disturbance</div>
            <button onClick={() => setDisturbance(!disturbance)} className={`w-full px-4 py-2 rounded-lg transition ${disturbance ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
              {disturbance ? '🔥 Sun load ON (heat gain doubled)' : 'Sun load OFF'}
            </button>
            <p className="text-xs text-slate-500 mt-2">Toggle to simulate sudden ambient heat (e.g. solar gain through facade)</p>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button onClick={() => setRunning(!running)} className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold rounded-lg hover:bg-cyan-400 transition">
            {running ? 'Pause' : 'Resume'}
          </button>
          <button onClick={reset} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5">
          <h3 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2"><Brain size={18} /> Experiments to try</h3>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            <li>Set I = 0, D = 0. Vary P from 0.5 to 10. Notice: low P = slow, high P = oscillation. There's no P that gives zero offset.</li>
            <li>P = 2, D = 0. Add I = 0.3. Watch the loop slowly close the remaining offset.</li>
            <li>Push P high (8+) and watch the loop oscillate. Now add D = 0.5 to dampen it.</li>
            <li>Stable loop, then toggle the sun load. See how fast the system rejects the disturbance — that's your tuning quality in real life.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, step, hint, unit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="font-mono text-cyan-400">{Number(value).toFixed(step < 1 ? 2 : 1)}{unit || ''}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setValue(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
      <p className="text-xs text-slate-500 mt-2">{hint}</p>
    </div>
  );
}

// ============================================================================
// TIER DIAGRAM (used inside lessons)
// ============================================================================

function TierDiagram() {
  return (
    <div className="my-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-700/40 rounded-lg p-3 text-center">
          <div className="text-purple-300 font-semibold text-sm">Tier 3 — Supervisory Layer</div>
          <div className="text-xs text-slate-400 mt-1">Servers • Dashboards • Trends • Alarms • Reports</div>
        </div>
        <div className="flex justify-center"><div className="text-slate-600">↕</div></div>
        <div className="bg-gradient-to-r from-cyan-900/40 to-cyan-800/20 border border-cyan-700/40 rounded-lg p-3 text-center">
          <div className="text-cyan-300 font-semibold text-sm">Tier 2 — Automation Layer</div>
          <div className="text-xs text-slate-400 mt-1">DDC Controllers • JACEs • Programmable Logic • Schedules</div>
        </div>
        <div className="flex justify-center"><div className="text-slate-600">↕</div></div>
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-700/40 rounded-lg p-3 text-center">
          <div className="text-emerald-300 font-semibold text-sm">Tier 1 — Field Layer</div>
          <div className="text-xs text-slate-400 mt-1">Sensors • Actuators • Valves • Dampers • VFDs • Meters</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LESSON RENDERER
// ============================================================================

function renderInline(text) {
  // bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function LessonView({ lesson, onComplete, onBack, onAskTutor }) {
  const [stage, setStage] = useState('content'); // content | quiz | done
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const submitAnswer = () => {
    if (selected === null) return;
    setRevealed(true);
    if (selected === lesson.quiz[quizIdx].correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIdx + 1 < lesson.quiz.length) {
      setQuizIdx(quizIdx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setStage('done');
    }
  };

  const passingScore = lesson.isBoss ? Math.ceil(lesson.quiz.length * 0.75) : Math.ceil(lesson.quiz.length * 0.6);
  const passed = score >= passingScore;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-6 transition">
          <ArrowLeft size={18} /> back to home
        </button>

        <div className="text-xs text-slate-500 mb-2 font-mono">
          MODULE {lesson.moduleNum} · {lesson.module.toUpperCase()} · {lesson.duration} MIN
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">{lesson.title}</h1>

        {stage === 'content' && (
          <>
            <div className="bg-gradient-to-br from-orange-950/30 to-slate-900 border border-orange-900/30 rounded-2xl p-5 mb-8">
              <div className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-2">Hook</div>
              <p className="text-slate-200 leading-relaxed">{lesson.hook}</p>
            </div>

            <div className="prose prose-invert max-w-none space-y-4">
              {lesson.content.map((block, idx) => {
                if (block.type === 'h3') return <h3 key={idx} className="text-xl font-bold text-cyan-300 mt-8 mb-3">{block.text}</h3>;
                if (block.type === 'p') return <p key={idx} className="text-slate-300 leading-relaxed">{renderInline(block.text)}</p>;
                if (block.type === 'bullets') return (
                  <ul key={idx} className="space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 leading-relaxed">
                        <span className="text-cyan-500 mt-1.5 flex-shrink-0">▸</span>
                        <span>{renderInline(item)}</span>
                      </li>
                    ))}
                  </ul>
                );
                if (block.type === 'callout') return (
                  <div key={idx} className="bg-cyan-950/30 border-l-4 border-cyan-500 rounded-r-lg p-4 my-5">
                    <p className="text-cyan-100 italic leading-relaxed">{renderInline(block.text)}</p>
                  </div>
                );
                if (block.type === 'diagram' && block.kind === 'tiers') return <TierDiagram key={idx} />;
                return null;
              })}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setStage('quiz')} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2">
                <Target size={18} /> Quick Check ({lesson.quiz.length} questions)
              </button>
              <button onClick={() => onAskTutor(lesson)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-4 rounded-xl transition flex items-center justify-center gap-2">
                <Sparkles size={18} /> Ask the Tutor
              </button>
            </div>
          </>
        )}

        {stage === 'quiz' && (
          <div>
            <div className="text-xs text-slate-500 mb-3 font-mono">QUESTION {quizIdx + 1} OF {lesson.quiz.length} · SCORE {score}</div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
              <p className="text-lg text-slate-100 mb-6 leading-relaxed">{lesson.quiz[quizIdx].q}</p>
              <div className="space-y-2">
                {lesson.quiz[quizIdx].options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === lesson.quiz[quizIdx].correct;
                  let cls = 'border-slate-700 bg-slate-800/50 hover:border-slate-600';
                  if (revealed) {
                    if (isCorrect) cls = 'border-green-500 bg-green-500/10';
                    else if (isSelected) cls = 'border-red-500 bg-red-500/10';
                    else cls = 'border-slate-800 bg-slate-900 opacity-60';
                  } else if (isSelected) {
                    cls = 'border-cyan-500 bg-cyan-500/10';
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => !revealed && setSelected(idx)}
                      disabled={revealed}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center gap-3 ${cls}`}
                    >
                      <span className="flex-1 text-slate-200">{opt}</span>
                      {revealed && isCorrect && <Check size={18} className="text-green-400" />}
                      {revealed && isSelected && !isCorrect && <X size={18} className="text-red-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
            {!revealed ? (
              <button onClick={submitAnswer} disabled={selected === null} className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-6 py-4 rounded-xl transition">
                Submit
              </button>
            ) : (
              <button onClick={nextQuestion} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2">
                {quizIdx + 1 < lesson.quiz.length ? 'Next question' : 'See result'} <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {stage === 'done' && (
          <div className="text-center py-8">
            <div className={`inline-block p-6 rounded-full mb-6 ${passed ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
              {passed ? <Trophy size={56} className="text-green-400" /> : <RotateCcw size={56} className="text-orange-400" />}
            </div>
            <h2 className="text-3xl font-bold mb-3">{passed ? 'Lesson Complete' : 'Almost there'}</h2>
            <p className="text-xl text-slate-300 mb-8">Score: <span className="text-cyan-400 font-mono">{score}/{lesson.quiz.length}</span></p>
            <div className="max-w-md mx-auto bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-900/40 rounded-2xl p-5 mb-8 text-left">
              <div className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-2">Key takeaway</div>
              <p className="text-slate-100">{lesson.takeaway}</p>
            </div>
            {passed ? (
              <button onClick={() => onComplete(lesson, score)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition inline-flex items-center gap-2">
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => { setStage('content'); setQuizIdx(0); setScore(0); setSelected(null); setRevealed(false); }} className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition inline-flex items-center gap-2">
                <RotateCcw size={18} /> Try again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// AI TUTOR
// ============================================================================

function TutorChat({ lesson, onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hey — I'm your BMS tutor. You're on "${lesson?.title || 'BMS Mastery'}". Ask me anything — to explain a concept differently, give Ghana examples, quiz you, or apply it to your VRF / Yakuver work.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    const lessonContext = lesson ? `The user is currently studying the BMS lesson titled "${lesson.title}". Lesson summary: ${lesson.takeaway}. They have 8+ years of MEP/HVAC experience and run an HVAC contracting firm (Yakuver Solutions) in Ghana. Use Ghana-relevant examples (GHC pricing, ECG tariffs, Midea VRF, hot humid climate) when useful. Keep replies tight and concrete.` : 'The user is studying building management systems.';

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert BMS/BAS tutor. ${lessonContext}`,
          messages: [...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.text })), { role: 'user', content: userMsg }],
        })
      });
      const data = await response.json();
      const reply = data.content?.map(c => c.text || '').join('\n') || 'Sorry — no response.';
      setMessages(m => [...m, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Could not reach the tutor — check your connection and try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col flex-1">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-4 transition">
          <ArrowLeft size={18} /> back
        </button>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-cyan-400" />
          <h1 className="text-2xl font-bold">Tutor</h1>
          {lesson && <span className="text-xs text-slate-500 font-mono">· {lesson.title}</span>}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-[60vh]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-cyan-500 text-slate-950 rounded-br-sm' : 'bg-slate-800 text-slate-100 rounded-bl-sm'}`}>
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask anything..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-4 py-3 text-slate-100"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold px-5 rounded-xl transition flex items-center gap-2">
            <Send size={18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Explain it like I have no idea', 'Give me a Ghana example', 'Quiz me harder', 'How does this apply to VRF?'].map(q => (
            <button key={q} onClick={() => setInput(q)} className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:border-cyan-700 hover:text-cyan-300 transition">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOME / DASHBOARD
// ============================================================================

function Home({ state, onLesson, onPidLab, onTutor, onFiveMin }) {
  const currentLesson = LESSONS.find(l => l.id === state.currentLesson) || LESSONS[0];
  const completed = state.completedLessons.length;
  const total = LESSONS.length;
  const progress = (completed / total) * 100;
  const level = state.xp < 500 ? 'Apprentice' : state.xp < 2000 ? 'Technician' : state.xp < 5000 ? 'Engineer' : state.xp < 10000 ? 'Senior' : 'Master';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-cyan-400">BMS</span> Mastery
            </h1>
            <span className="text-xs font-mono text-slate-500">v0.1 · Gabs</span>
          </div>
          <p className="text-slate-400">From MEP engineer to BMS expert — one micro-lesson at a time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Stat icon={<Flame className="text-orange-400" />} label="Streak" value={`${state.streak}d`} />
          <Stat icon={<Zap className="text-yellow-400" />} label="XP" value={state.xp} sub={level} />
          <Stat icon={<Trophy className="text-cyan-400" />} label="Done" value={`${completed}/${total}`} />
        </div>

        {/* Today's lesson - the main CTA */}
        <button onClick={() => onLesson(currentLesson)} className="w-full text-left group block mb-4">
          <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-900 border border-cyan-900/50 hover:border-cyan-500/70 rounded-2xl p-6 transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">
              <BookOpen size={14} /> Today's Lesson
            </div>
            <div className="text-xs text-slate-500 mb-1 font-mono">Module {currentLesson.moduleNum} · {currentLesson.module} · {currentLesson.duration} min</div>
            <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h2>
            <p className="text-slate-400 text-sm line-clamp-2">{currentLesson.hook}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-cyan-400 font-semibold">
              Start lesson <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
            </div>
          </div>
        </button>

        {/* Module progress bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Module 1 — Foundations</span>
            <span className="font-mono">{completed}/{total}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <QuickAction icon={<Sliders className="text-cyan-400" />} label="PID Lab" sub="Drag sliders, watch a real loop" onClick={onPidLab} />
          <QuickAction icon={<Sparkles className="text-purple-400" />} label="Ask Tutor" sub="Claude, in context of your lesson" onClick={() => onTutor(null)} />
          <QuickAction icon={<Coffee className="text-orange-400" />} label="5-min Mode" sub="One micro-activity, that's it" onClick={onFiveMin} />
          <QuickAction icon={<Brain className="text-pink-400" />} label="Flashcards" sub={`${state.flashcards.length} cards to review`} onClick={() => alert('Flashcard review coming next build — for now your takeaways are saved.')} />
        </div>

        {/* All lessons */}
        <div>
          <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-3">All Lessons — Module 1</h3>
          <div className="space-y-2">
            {LESSONS.map((l, idx) => {
              const isDone = state.completedLessons.includes(l.id);
              const isCurrent = state.currentLesson === l.id;
              const isLocked = idx > 0 && !state.completedLessons.includes(LESSONS[idx - 1].id) && !isCurrent && !isDone;
              return (
                <button
                  key={l.id}
                  onClick={() => !isLocked && onLesson(l)}
                  disabled={isLocked}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${
                    isDone ? 'bg-green-950/20 border-green-900/40 hover:border-green-700' :
                    isCurrent ? 'bg-cyan-950/30 border-cyan-700/50 hover:border-cyan-500' :
                    isLocked ? 'bg-slate-900/30 border-slate-800/50 opacity-40 cursor-not-allowed' :
                    'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono ${
                    isDone ? 'bg-green-500/20 text-green-400' :
                    isCurrent ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? <Check size={14} /> : (idx + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">{l.title}</div>
                    <div className="text-xs text-slate-500 font-mono">{l.duration} min{l.isBoss && ' · BOSS CHECK'}</div>
                  </div>
                  {!isLocked && <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600">
          More modules unlock as content is added. ~200 lessons mapped in the curriculum spec.
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span></div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 font-mono">{sub}</div>}
    </div>
  );
}

function QuickAction({ icon, label, sub, onClick }) {
  return (
    <button onClick={onClick} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 text-left transition">
      <div className="mb-2">{icon}</div>
      <div className="text-sm font-semibold text-slate-200">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </button>
  );
}

// ============================================================================
// APP
// ============================================================================

export default function App() {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState('home'); // home | lesson | pid | tutor
  const [activeLesson, setActiveLesson] = useState(null);
  const [tutorLesson, setTutorLesson] = useState(null);

  useEffect(() => { saveState(state); }, [state]);

  const openLesson = (lesson) => {
    setActiveLesson(lesson);
    setView('lesson');
  };

  const completeLesson = (lesson, score) => {
    const today = new Date().toDateString();
    const wasYesterday = state.lastStudyDate && (new Date(today) - new Date(state.lastStudyDate)) / 86400000 <= 1.5;
    const newStreak = state.lastStudyDate === today ? state.streak : (wasYesterday ? state.streak + 1 : 1);

    const xpGained = 10 + score * 5 + (lesson.isBoss ? 100 : 0);
    const idx = LESSONS.findIndex(l => l.id === lesson.id);
    const nextLessonId = idx + 1 < LESSONS.length ? LESSONS[idx + 1].id : lesson.id;

    setState({
      ...state,
      xp: state.xp + xpGained,
      streak: newStreak,
      lastStudyDate: today,
      completedLessons: state.completedLessons.includes(lesson.id) ? state.completedLessons : [...state.completedLessons, lesson.id],
      quizScores: { ...state.quizScores, [lesson.id]: score },
      flashcards: state.flashcards.includes(lesson.takeaway) ? state.flashcards : [...state.flashcards, lesson.takeaway],
      currentLesson: nextLessonId,
    });
    setView('home');
  };

  const openTutor = (lesson) => {
    setTutorLesson(lesson || activeLesson);
    setView('tutor');
  };

  const fiveMin = () => {
    const idx = LESSONS.findIndex(l => l.id === state.currentLesson);
    const lesson = LESSONS[idx] || LESSONS[0];
    openLesson(lesson);
  };

  if (view === 'pid') return <PIDSimulator onBack={() => setView('home')} />;
  if (view === 'tutor') return <TutorChat lesson={tutorLesson} onBack={() => setView(activeLesson ? 'lesson' : 'home')} />;
  if (view === 'lesson' && activeLesson) return <LessonView lesson={activeLesson} onComplete={completeLesson} onBack={() => setView('home')} onAskTutor={openTutor} />;
  return <Home state={state} onLesson={openLesson} onPidLab={() => setView('pid')} onTutor={openTutor} onFiveMin={fiveMin} />;
}
