# BMS Mastery — Full Curriculum Specification

**For:** Gabs (Yakuver Solutions Ltd)
**Goal:** Take an experienced MEP/HVAC engineer from zero BMS knowledge to expert-adjacent level in 4 months through ADHD-friendly micro-learning.
**Format:** 5–15 minute lessons, interactive where possible, spaced repetition, gamified progression.
**Total lessons:** ~200 across 10 modules.

---

## Design Principles

1. **Every lesson ≤ 15 minutes.** No exceptions.
2. **Every lesson ends with active recall** — 3–5 question quiz.
3. **Every concept gets a visual** — diagram, animation, or interactive sim.
4. **Spaced repetition** built in — concepts return at 1 day, 3 days, 7 days, 21 days.
5. **One clear "next" at all times** — no decision fatigue.
6. **Streaks and XP** for momentum, but never blocking — you can skip.
7. **AI tutor available in every lesson** — "ask Claude about this" button.

---

## MODULE 1: Foundations (Weeks 1–2) — 22 lessons

The bedrock. Skipping this is why most BMS engineers are mediocre.

### 1.1 What is a BMS?
- L1: BMS vs BAS vs SCADA — terminology landscape
- L2: The 3-tier architecture (field, automation, supervisory)
- L3: Why BMS exists — comfort, efficiency, safety, compliance
- L4: A day in the life of a BMS engineer

### 1.2 Control Theory Essentials
- L5: Open loop vs closed loop control
- L6: The feedback loop — setpoint, process variable, error
- L7: On/off control and its limitations (deadband, hysteresis)
- L8: Proportional control — gain, offset, proportional band
- L9: Integral action — eliminating offset
- L10: Derivative action — anticipating change
- L11: **Interactive: Tune a PID loop** (drag sliders, watch the curve)
- L12: PID tuning methods — Ziegler-Nichols, trial and error, autotune
- L13: Cascade control and feed-forward

### 1.3 Signals and I/O
- L14: Analog vs digital signals
- L15: Analog inputs — 0–10V, 4–20mA, RTDs, thermistors
- L16: Analog outputs — driving valves and dampers
- L17: Digital inputs — dry contacts, status feedback
- L18: Digital outputs — relays, triacs, control of motors
- L19: Pulse signals and accumulators
- L20: Signal isolation, grounding, shielding

### 1.4 Module Boss Quiz
- L21: 20-question comprehensive quiz on foundations
- L22: Foundations recap + flashcard review

---

## MODULE 2: HVAC Controls Applied (Weeks 3–4) — 28 lessons

Where your 8 years of HVAC experience pays off massively. Most lessons will be revision + controls layer added.

### 2.1 Air Handling Units
- L23: AHU anatomy from a controls perspective
- L24: Supply air temperature control
- L25: Mixed air economizer logic
- L26: Static pressure reset (ASHRAE G36 method)
- L27: Supply air temperature reset
- L28: Fan VFD control strategies
- L29: Demand control ventilation (CO2-based)
- L30: AHU safety interlocks — freezestat, smoke, high static
- L31: **Interactive: Virtual AHU** — click components, simulate failures
- L32: Writing an AHU sequence of operation

### 2.2 Chilled Water Systems
- L33: Primary-secondary vs variable primary
- L34: Chiller sequencing and staging
- L35: Lead/lag rotation strategies
- L36: Chilled water supply temperature reset
- L37: Condenser water reset
- L38: Cooling tower control — VFD, valve bypass, basin heaters
- L39: Pump control — DP setpoint, DP reset
- L40: Chiller plant optimization basics

### 2.3 Terminal Units
- L41: VAV box control — pressure-independent logic
- L42: VAV with reheat sequences
- L43: Fan coil unit control
- L44: Chilled beam control
- L45: Radiant floor heating/cooling control

### 2.4 VRF/VRV Systems
- L46: VRF architecture from a controls view
- L47: VRF gateways — Daikin DMS, Midea CCM, Mitsubishi AE-200
- L48: What VRF exposes to BMS (and what it hides)
- L49: VRF integration patterns and pitfalls
- L50: Heat recovery VRF control logic

### 2.5 Boilers and Heat Pumps
- L51: Boiler sequencing and modulation
- L52: Outdoor reset curves
- L53: Heat pump control — defrost, supplemental heat
- L54: Hybrid plants — when to run what

### 2.6 Ventilation and IAQ
- L55: DCV strategies and CO2 sensor placement
- L56: Pressurization control — labs, hospitals, kitchens
- L57: Heat recovery wheel and plate HEX control

### 2.7 Module Boss Quiz
- L58: 25-question comprehensive HVAC controls quiz
- L59: HVAC controls recap

---

## MODULE 3: Protocols Deep Dive (Week 5) — 24 lessons

The single biggest differentiator between weak and strong BMS engineers.

### 3.1 BACnet
- L60: Why BACnet exists — the open protocol revolution
- L61: BACnet architecture — devices, objects, properties
- L62: Object types — AI, AO, AV, BI, BO, BV, MSV, schedule, calendar
- L63: Services — Read, Write, COV, WhoIs/IAm
- L64: BACnet MS/TP — wiring, addressing, troubleshooting
- L65: BACnet/IP — UDP 47808, BBMD, broadcast domains
- L66: BACnet/SC (secure BACnet) — the future
- L67: **Interactive: BACnet object explorer**
- L68: Reading a BACnet device with YABE

### 3.2 Modbus
- L69: Modbus RTU — serial, master-slave, function codes
- L70: Modbus TCP — Ethernet, simultaneous masters
- L71: Register types — coils, discrete inputs, holding, input
- L72: The byte order nightmare — endianness, word swap
- L73: Reading a Modbus device with QModMaster
- L74: Modbus gotchas — common vendor traps

### 3.3 KNX
- L75: KNX architecture — twisted pair, line, area
- L76: KNX group addresses
- L77: ETS6 walkthrough
- L78: When to use KNX vs BACnet

### 3.4 DALI
- L79: DALI-2 fundamentals — addressable lighting control
- L80: DALI commissioning workflow
- L81: DALI gateways to BACnet/Modbus

### 3.5 Modern protocols
- L82: MQTT for IoT data forwarding
- L83: OPC-UA — bridging BMS to industrial systems
- L84: REST APIs and webhooks in modern BMS

### 3.6 Module Boss Quiz
- L85: 25-question protocols quiz
- L86: Protocol comparison matrix flashcards

---

## MODULE 4: Field Devices (Week 6) — 18 lessons

### 4.1 Sensors
- L87: Temperature — RTD, thermistor, thermocouple, accuracy classes
- L88: Humidity — capacitive, resistive, drift
- L89: Pressure — DP, static, gauge
- L90: Flow — turbine, magnetic, ultrasonic, vortex
- L91: CO2 and IAQ sensors — NDIR principle
- L92: Occupancy and presence sensors
- L93: Energy meters — CTs, Rogowski coils, revenue grade

### 4.2 Actuators
- L94: Valve actuators — spring return vs non-spring
- L95: Damper actuators — torque sizing
- L96: Actuator control signals — modulating, floating, 2-position
- L97: Failure modes and fail position selection

### 4.3 Valves and Dampers
- L98: Valve characteristics — linear, equal-percentage, quick-open
- L99: Valve sizing — Cv, authority, rangeability
- L100: PICVs and dynamic balancing valves
- L101: Damper types — opposed blade, parallel blade

### 4.4 VFDs from a BMS view
- L102: VFD control modes
- L103: VFD network integration — Modbus, BACnet cards
- L104: Module quiz

---

## MODULE 5: Controllers and Architecture (Week 7) — 16 lessons

### 5.1 DDC Controllers
- L105: Application-specific vs general purpose
- L106: I/O capacity, processing, memory
- L107: Programmable logic types — wire sheet, ladder, structured text
- L108: Major vendor controller families overview

### 5.2 Supervisory Layer
- L109: What a supervisor does — schedules, alarms, trends, graphics
- L110: Niagara JACE — the universal supervisor
- L111: Server-based supervisors vs embedded
- L112: Web-based front ends

### 5.3 Network Architecture
- L113: BMS network topology patterns
- L114: VLANs for BMS — OT network segmentation
- L115: Redundancy and failover
- L116: Edge computing in modern BMS

### 5.4 Selection and Sizing
- L117: Controller selection methodology
- L118: Spare I/O budgeting
- L119: Panel layout and grouping logic
- L120: Module quiz

---

## MODULE 6: Niagara N4 (Weeks 8–9) — 24 lessons

The single highest ROI skill. Aim for TCP certification at the end.

### 6.1 Niagara Architecture
- L121: Stations, JACEs, Supervisors
- L122: Fox protocol and NiagaraNetwork
- L123: Modules, drivers, palettes
- L124: Tags and hierarchies (Haystack)

### 6.2 Workbench Basics
- L125: First time in Workbench — UI walkthrough
- L126: Creating a station
- L127: Adding the BACnet driver
- L128: Adding the Modbus driver
- L129: Discovering devices and learning points

### 6.3 Wire Sheets
- L130: Wire sheet fundamentals
- L131: Logic kit components
- L132: Math kit and conversions
- L133: Building a simple control loop
- L134: **Interactive: Build an AHU control on a virtual wire sheet**

### 6.4 Points and Extensions
- L135: Numeric, boolean, string, enum points
- L136: Point extensions — alarms, history, schedules
- L137: Point linking and rationalization

### 6.5 Schedules, Alarms, Histories
- L138: Schedule programming
- L139: Calendar and special days
- L140: Alarm classes, routing, priority
- L141: History collection and exports

### 6.6 Graphics
- L142: PX Editor basics
- L143: Binding points to graphics
- L144: Animation and dynamic elements
- L145: Building an operator dashboard

### 6.7 TCP Exam Prep
- L146: TCP exam structure and tips
- L147: Practice questions and final review
- L148: Module boss quiz

---

## MODULE 7: Design and Engineering (Weeks 10–11) — 20 lessons

### 7.1 The Design Process
- L149: BMS scope definition
- L150: Reading mechanical, electrical, architectural drawings for BMS scope
- L151: Coordination with MEP design

### 7.2 Point Lists
- L152: Anatomy of a point list / I/O schedule
- L153: Point naming conventions
- L154: **Interactive: Generate a point list for an AHU**
- L155: Point list templates by equipment type
- L156: Spare I/O strategy

### 7.3 Sequence of Operation
- L157: SOO structure (ASHRAE Guideline 36)
- L158: Writing AHU SOO
- L159: Writing chilled water plant SOO
- L160: Writing VRF integration SOO
- L161: **Interactive: SOO builder** — drag blocks, validate logic

### 7.4 Controls Drawings
- L162: Riser diagrams
- L163: Schematic / wiring diagrams
- L164: Panel layout drawings
- L165: Title block and documentation standards

### 7.5 BOQ and Pricing
- L166: BMS BOQ structure
- L167: Hardware vs software vs labor split
- L168: Ghana-specific pricing factors (GHC, import duties, local labor)
- L169: Markup and margin strategy

### 7.6 Module Quiz
- L170: Engineering deliverables comprehensive quiz

---

## MODULE 8: Commissioning (Week 12) — 16 lessons

### 8.1 Pre-Functional Phase
- L171: Pre-functional checklists (PFC)
- L172: Installation verification
- L173: Power-up and panel checks

### 8.2 Point-to-Point Testing
- L174: P2P methodology
- L175: Sensor calibration on site
- L176: Valve and damper stroking
- L177: P2P documentation

### 8.3 Functional Performance Testing
- L178: FPT methodology
- L179: Testing against the SOO
- L180: Capturing trends as evidence
- L181: Failure mode testing — what happens when the fire alarm hits

### 8.4 Tuning and Optimization
- L182: PID loop tuning on a live system
- L183: Schedule and setpoint optimization
- L184: Energy benchmarking after Cx

### 8.5 Handover
- L185: As-built documentation
- L186: Training the FM team
- L187: Module boss quiz

---

## MODULE 9: Specialties (Weeks 13–14) — 18 lessons

### 9.1 Analytics and FDD
- L188: Why FDD matters — the operating phase
- L189: Rule-based vs ML-based FDD
- L190: SkySpark, Clockworks, Switch overview
- L191: Common fault rules library
- L192: Setting up trend collection for analytics

### 9.2 Cybersecurity
- L193: The BMS threat landscape
- L194: Network segmentation for OT
- L195: BACnet/SC and secure communication
- L196: ISA/IEC 62443 basics
- L197: Hardening Niagara

### 9.3 Smart Metering and Energy
- L198: Sub-metering strategy
- L199: M&V — measurement and verification basics
- L200: ECG tariff structures and load shifting in Ghana
- L201: Solar PV + BMS integration

### 9.4 Emerging Areas
- L202: Digital twins for buildings
- L203: AI-driven optimization (BrainBox AI and similar)
- L204: Grid-interactive buildings
- L205: Module boss quiz

---

## MODULE 10: Exam Prep + Capstone — 12 lessons

### 10.1 TCP Mock Exams
- L206: TCP mock exam 1 (50 questions, timed)
- L207: TCP mock exam 2
- L208: TCP mock exam 3

### 10.2 BOW and CCP Prep
- L209: BOW (BACnet Operator Workstation) prep
- L210: CCP commissioning credential overview

### 10.3 Capstone Project
- L211: Capstone brief — design BMS for a 3-floor Accra office
- L212: Submit point list
- L213: Submit SOO
- L214: Submit BOQ
- L215: Capstone review and feedback (AI tutor + self-assessment rubric)

### 10.4 Graduation
- L216: Where to go next — specialization paths
- L217: Building your BMS portfolio for Yakuver Solutions

---

## Cross-Cutting Features

### The AI Tutor
Available on every lesson via a "Ask Claude" button. Pre-loaded with lesson context. Common prompts:
- "Explain this more simply"
- "Give me a real-world example"
- "Quiz me on this"
- "How does this apply to Ghana / VRF / Midea VC MAX?"

### Spaced Repetition Engine
Every quiz question enters a flashcard pool. Algorithm based on SM-2 (Anki):
- Correct + easy → 21 day interval
- Correct + hard → 7 day interval
- Wrong → 1 day interval, repeat

### Streak System
- Daily streak — at least 1 lesson per day
- "Streak freeze" — 1 missed day per week forgiven
- Weekly XP target, monthly XP target

### Gamification
- XP per lesson (10), per quiz pass (20), per module boss (100)
- Levels: Apprentice (0–500), Technician (500–2000), Engineer (2000–5000), Senior (5000–10000), Master (10000+)
- Badges for module completion, perfect quizzes, streak milestones

### "5-Minute Mode"
For low-energy ADHD days. One button gives you exactly one 5-min activity:
- A single flashcard review session, OR
- One micro-lesson, OR
- One quiz question set

### Voice Mode
Lessons readable aloud for commute / site visits. TTS-driven.

### Offline Mode
All lessons cached locally. Progress syncs when online.

---

## Tech Stack (Tier 1 — Personal MVP)

- **Frontend:** React + Tailwind + Framer Motion
- **State:** Zustand
- **Storage:** IndexedDB (Dexie.js) for offline lessons + progress
- **AI Tutor:** Claude API direct from browser (you handle API key locally)
- **Charts/Sims:** Recharts for data viz, custom Canvas for PID sim
- **Hosting:** Vercel (or just open the HTML locally)
- **No backend, no auth** — single-user, your machine only

## Tech Stack (Tier 2 — Future Product)

- **Frontend:** React Native (Expo) — same stack as Viszio App
- **Backend:** Node.js + Express + Postgres on Railway
- **AI Tutor:** Claude API via backend proxy
- **Auth:** Email + password + magic link
- **Payments:** Paystack (Africa), Stripe (global)
- **Push notifications:** Expo Push
- **Content management:** Simple admin panel for editing lessons

---

## Content Authoring Standard

Every lesson follows this structure:

```
# [Lesson Title]
⏱ 8 min  •  Module 1.2  •  Lesson 8 of 217

## Hook (30 seconds)
[A real-world scenario or surprising fact that makes you care]

## Core Concept (3–5 minutes)
[The actual teaching. Visual-first. Diagram or animation.]

## Worked Example (2 minutes)
[Show it applied to a real building. Ghana context when relevant.]

## Quick Check (3 questions, 1–2 minutes)
[Active recall — multiple choice or fill-in]

## Key Takeaway
[One sentence. Goes on a flashcard.]

## Next Up
[The next lesson, one tap away]
```

---

## Success Metrics (Personal)

By end of Month 4, you should be able to:
- [ ] Pass TCP mock exams at 85%+ consistently
- [ ] Write a complete AHU SOO from memory
- [ ] Generate a point list for any HVAC equipment in under 30 min
- [ ] Read and trace a BACnet network with YABE
- [ ] Read and trace a Modbus network with QModMaster
- [ ] Explain BMS scope in client meetings with confidence
- [ ] Bid BMS scope on a Yakuver project
- [ ] Identify 3 BMS pain points worth productizing
