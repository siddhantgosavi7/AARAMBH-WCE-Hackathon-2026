# AquaFeed Optimizer: 3-Minute Hackathon Demo Script

---

## 🎬 Act 1: The Hook & Aquaculture Crisis (0:00 – 0:30)

**Speaker**:
> "Good morning judges! In aquaculture, feed makes up **60% to 70% of total farm expenditure**. Yet today, millions of fish farmers still feed based on static, blind calendar tables.
>
> When water gets too hot or dissolved oxygen drops, fish simply cannot eat. Traditional farmers keep dumping expensive pellets into the water anyway. Those pellets rot on the pond bed, leeching toxic ammonia and causing catastrophic, midnight oxygen crashes where an entire pond can suffocate overnight.
>
> That's why we built **AquaFeed Optimizer** — an intelligent, software-only decision engine that links diurnal water physics and species bioenergetics to feed fish the exact gram at the exact hour, saving money, saving ponds, and directly advancing **UN SDGs 2, 6, 12, and 14**."

---

## 🖥 Act 2: Fleet Dashboard & The 3 Demo Scenarios (0:30 – 1:15)

**Action**: Open `http://localhost:3000` (Dashboard). Show the 3 distinct ponds.

**Speaker**:
> "Here is our live farm dashboard. We are currently monitoring 3 commercial ponds in three radically different biological states:
> 
> 1. **Pond 1 (Nile Tilapia - Optimal)**: Water temperature is 28.5°C, DO is a healthy 5.8 mg/L. Tilapia is in the Grower stage. Feed factor is at 100% capacity.
> 2. **Pond 2 (Rohu Carp - Heat Stress)**: During an afternoon thermal spike reaching 34.2°C, our bell-curve thermal modulator automatically throttled feed down by 38% to prevent metabolic exhaustion.
> 3. **Pond 3 (Pacific White Shrimp - Nocturnal DO Crash)**: Notice this flashing crimson alert! Early morning respiration caused Dissolved Oxygen to plummet to 2.6 mg/L. Our system **instantly suspended all feeding**, preventing ₹4,500 of wasted feed and protecting the shrimp from asphyxiation."

---

## 🔍 Act 3: Deep Dive & Explainable Feeding Engine (1:15 – 2:00)

**Action**: Click into **Pond 1 (Tilapia)** to view `PondDetail`.

**Speaker**:
> "Let's click into Pond 1. Rather than being a black-box AI, AquaFeed provides complete **explainability** for the farm manager:
>
> - **Biomass**: 830 kg of active fish biomass.
> - **Nominal baseline**: 20.8 kg/day.
> - **Today's modulated ration**: 18.2 kg/day.
> - Look at this **'Why this amount?' panel**: It clearly breaks down the factors: Temperature Factor is 1.0 (optimal 28°C), Dissolved Oxygen factor is 0.88, with zero recent crash penalties.
> - Below, the **Circadian Meal Scheduler** has split the daily feed into daylight windows at 08:00 and 16:30, completely avoiding the dangerous pre-dawn oxygen trough.
> - When farm hands log appetite feedback — like 'eaten fully' or 'leftovers observed' — our engine immediately self-corrects the next scheduled meal."

---

## 🎛 Act 4: Interactive "What-If" Simulation (2:00 – 2:30)

**Action**: Switch to the **What-If Simulator** tab.

**Speaker**:
> "Aquaculture managers need foresight. With our interactive **What-If Simulator**, farmers can test environmental scenarios on the fly.
>
> Watch what happens as I adjust this Dissolved Oxygen slider.
> - At 6.0 mg/L, feed is 100%.
> - As DO falls to 4.0 mg/L, feed scales smoothly down to 50%.
> - The moment DO drops below 3.0 mg/L... **BOOM! The feed drops to zero instantly**, and a critical hypoxia warning is triggered.
> 
> The pure mathematical engine evaluates this in under 5 milliseconds!"

---

## 💰 Act 5: Environmental Dividends & Closing (2:30 – 3:00)

**Action**: Navigate to the **Reports** tab.

**Speaker**:
> "Finally, let's look at the impact on our **Reports & ESG Dashboard**:
>
> - **Feed Saved**: Over 430 kg of feed saved in this crop cycle alone.
> - **Direct Cost Savings**: Over ₹32,000 saved straight to the farmer's bottom line.
> - **FCR Reduction**: Slashed from 1.75 down to 1.38.
> - **Environmental Protection**: Over 14.8 kg of toxic elemental nitrogen avoided from entering local waterways, drastically lowering our pond Pollution Risk Score.
>
> **AquaFeed Optimizer** transforms aquaculture from an imprecise, polluting gamble into a high-precision, profitable, and ecologically sustainable science.
>
> Thank you, and we're ready for your questions!"
