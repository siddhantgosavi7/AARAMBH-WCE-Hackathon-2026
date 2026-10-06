# Mathematical & Bioenergetic Feeding Algorithm Specification

## 1. Overview & Bioenergetic Foundation

Aquatic organisms are ectothermic poikilotherms: their metabolic rate, enzyme kinetics, gastric evacuation time, and respiratory demand are fundamentally dictated by ambient water temperature and dissolved oxygen.

AquaFeed Optimizer replaces blunt fixed-percentage feeding with a multi-variable bioenergetic response model:
$$\text{Feed}_{\text{actual}} = \text{Biomass} \times R_{\text{base}}(\text{stage}) \times f_T(T) \times f_{\text{DO}}(\text{DO}) \times f_{\text{feedback}}$$

---

## 2. Mathematical Formulations

### 2.1 Effective Biomass Calculation
Given fish count $N$, mean individual weight $\overline{W}_t$ (grams), and estimated cohort survival rate $S \in (0, 1]$:
$$\text{Biomass}_t \,(\text{kg}) = \frac{N \times \overline{W}_t \times S}{1000}$$

### 2.2 SGR-Driven Growth Model
Fish growth follows a Specific Growth Rate (SGR, % weight gain per day):
$$\text{SGR}_{\text{nominal}} = \frac{\ln(W_{\text{end}}) - \ln(W_{\text{start}})}{\Delta t} \times 100$$
Under real-time pond conditions, daily weight increment is modulated by environmental stress coefficients:
$$\text{StressModifier} = \min(f_T(T), f_{\text{DO}}(\text{DO}))$$
$$\overline{W}_{t+1} = \overline{W}_t \times \left(1 + \frac{\text{SGR}_{\text{nominal}} \times \text{StressModifier}}{100}\right)$$

### 2.3 Thermal Modulator: $f_T(T)$
The metabolic reaction to temperature is modeled via a smooth generalized bell-curve (modified Beta/Gaussian curve bounded between $0.0$ and $1.0$):
- If $T \le T_{\min\text{-lethal}}$ or $T \ge T_{\max\text{-lethal}}$: $f_T(T) = 0.0$
- If $T_{\text{opt-low}} \le T \le T_{\text{opt-high}}$: $f_T(T) = 1.0$
- In sub-optimal warm ranges ($T_{\text{opt-high}} < T < T_{\max\text{-lethal}}$):
  $$f_T(T) = \cos^2\left(\frac{\pi}{2} \cdot \frac{T - T_{\text{opt-high}}}{T_{\max\text{-lethal}} - T_{\text{opt-high}}}\right)$$
- In sub-optimal cool ranges ($T_{\min\text{-lethal}} < T < T_{\text{opt-low}}$):
  $$f_T(T) = \cos^2\left(\frac{\pi}{2} \cdot \frac{T_{\text{opt-low}} - T}{T_{\text{opt-low}} - T_{\min\text{-lethal}}}\right)$$

*Characteristics*: Continuously differentiable ($C^1$), smoothly diminishes feeding towards zero without abrupt discontinuities.

### 2.4 Dissolved Oxygen Modulator: $f_{\text{DO}}(\text{DO})$
Fish cannot metabolize digested nutrients without oxygen (hypoxia causes metabolic acidosis and feed regurgitation).
$$f_{\text{DO}}(\text{DO}) = \begin{cases} 
1.0 & \text{if } \text{DO} \ge 5.0\text{ mg/L} \\
\frac{\text{DO} - 3.0}{5.0 - 3.0} = 0.5 \times (\text{DO} - 3.0) & \text{if } 3.0 \le \text{DO} < 5.0\text{ mg/L} \\
0.0 & \text{if } \text{DO} < 3.0\text{ mg/L} \quad (\textbf{CRITICAL: CEASE FEEDING})
\end{cases}$$

### 2.5 Daily Biological FCR Cap
To prevent overfeeding under hyper-optimal conditions, the daily ration is capped at:
$$\text{Feed}_{\max} = \text{Biomass} \times \text{MaxDailyRate}(\text{stage})$$

### 2.6 Waste & Pollution Quantification
Protein consists on average of $16\%$ elemental nitrogen ($\text{N}$). Fish assimilate only a fraction ($\text{Retention} \approx 0.25 - 0.35$), while unconsumed feed or excreted catabolites are discharged:
$$N_{\text{load}} = \text{Feed}_{\text{applied}} \,(\text{kg}) \times \frac{\text{Protein}\%}{100} \times 0.16 \times (1 - \text{Retention})$$

$$\text{Pollution Risk Score} \, (0-100) = \min\left(100, \, \left( \frac{N_{\text{load}}}{\text{Area}_{\text{ha}} \times 2.0} \times 40 + (1 - f_{\text{DO}}) \times 40 + \text{WastePenalty} \times 20 \right)\right)$$

### 2.7 Feed Saved & Dividends vs. Static Baseline
Static baseline uses a fixed stage-average table without water adjustments:
$$\text{Feed}_{\text{baseline}} = \text{Biomass} \times R_{\text{base}}$$
$$\Delta \text{FeedSaved} \,(\text{kg}) = \max(0, \, \text{Feed}_{\text{baseline}} - \text{Feed}_{\text{actual}})$$
$$\text{CostSaved} \, (₹) = \Delta \text{FeedSaved} \times \text{CostPerKg} \quad (\text{tunable default } ₹75/\text{kg})$$
$$\Delta N_{\text{avoided}} \,(\text{kg}) = \Delta \text{FeedSaved} \times \frac{\text{Protein}\%}{100} \times 0.16 \times (1 - \text{Retention})$$

---

## 3. Species Parameter Specifications (Tunable Defaults)

| Parameter | Nile Tilapia (*O. niloticus*) | Rohu Carp (*L. rohita*) | Pacific White Shrimp (*L. vannamei*) | Unit |
| :--- | :--- | :--- | :--- | :--- |
| **$T_{\min\text{-lethal}}$** | 12.0 | 14.0 | 16.0 | $^\circ\text{C}$ |
| **$T_{\text{opt-low}}$** | 27.0 | 26.0 | 28.0 | $^\circ\text{C}$ |
| **$T_{\text{opt-high}}$** | 31.0 | 30.0 | 32.0 | $^\circ\text{C}$ |
| **$T_{\max\text{-lethal}}$** | 38.0 | 36.0 | 35.0 | $^\circ\text{C}$ |
| **Critical DO Threshold** | 3.0 | 3.2 | 3.5 | $\text{mg/L}$ |
| **Optimal DO Threshold** | 5.0 | 5.0 | 5.0 | $\text{mg/L}$ |
| **Default N Retention** | 0.30 | 0.28 | 0.24 | fraction |
| **Target FCR** | 1.40 | 1.65 | 1.30 | ratio |

---

## 4. Growth Stage Matrices

### Nile Tilapia
1. **Fry** (0.01g – 1.0g): Base Rate = 15.0%, Protein = 42%, 6 meals/day, SGR = 7.5%
2. **Fingerling** (1.0g – 20.0g): Base Rate = 8.0%, Protein = 36%, 4 meals/day, SGR = 4.5%
3. **Juvenile** (20.0g – 100.0g): Base Rate = 4.5%, Protein = 32%, 3 meals/day, SGR = 2.5%
4. **Grower** (100.0g – 400.0g): Base Rate = 2.5%, Protein = 30%, 2 meals/day, SGR = 1.2%
5. **Finisher** (> 400.0g): Base Rate = 1.8%, Protein = 28%, 2 meals/day, SGR = 0.8%

### Rohu Carp
1. **Fry** (0.01g – 1.0g): Base Rate = 12.0%, Protein = 40%, 6 meals/day, SGR = 6.0%
2. **Fingerling** (1.0g – 25.0g): Base Rate = 6.5%, Protein = 34%, 4 meals/day, SGR = 3.5%
3. **Juvenile** (25.0g – 150.0g): Base Rate = 3.5%, Protein = 30%, 3 meals/day, SGR = 2.0%
4. **Grower** (150.0g – 600.0g): Base Rate = 2.2%, Protein = 28%, 2 meals/day, SGR = 1.0%
5. **Finisher** (> 600.0g): Base Rate = 1.5%, Protein = 26%, 2 meals/day, SGR = 0.6%

### Whiteleg Shrimp (L. vannamei)
1. **Post-Larvae (PL)** (0.01g – 0.5g): Base Rate = 18.0%, Protein = 45%, 6 meals/day, SGR = 8.0%
2. **Juvenile** (0.5g – 5.0g): Base Rate = 7.0%, Protein = 38%, 5 meals/day, SGR = 4.0%
3. **Grower** (5.0g – 18.0g): Base Rate = 3.8%, Protein = 36%, 4 meals/day, SGR = 2.0%
4. **Finisher** (> 18.0g): Base Rate = 2.5%, Protein = 35%, 3 meals/day, SGR = 1.2%

---

## 5. Circadian Meal Scheduling Rules

1. **Circadian Exclusion Windows**: Feeding is prohibited between 21:00 and 06:30 (nighttime and dawn DO depression).
2. **Thermal Avoidance**: For hot climates, noon peak meals (12:30–14:00) are shifted or scaled back if temperature $> 33^\circ\text{C}$.
3. **Adaptive Hunger Feedback**:
   - Previous meal left uneaten ($>15\%$ leftovers): Reduce subsequent meal by 40%.
   - Previous meal cleaned up quickly ($<5\%$ leftover, vigorous feeding): Maintain nominal allowance.
4. **Post-Crash Recovery Buffer**: If pond experienced DO $< 3.0\text{ mg/L}$ within the preceding 24 hours, cap total daily feeding at $60\%$ of nominal.
