// Refactored simulateTraining function with corrected gain and elastic logic

const baseStats = ['JS','JR','OD','HA','DR','PA','IS','ID','RB','SB'];

const trainingEffects = {
  "JS (PG/SG)": { JS: 0.5, JR: 0.1, DR: 0.05, HA: 0.05 },
  "JS (SF/PF)": { JS: 0.4, JR: 0.05, IS: 0.2 },
  "JS (SG/SF)": { JS: 0.5, JR: 0.1, DR: 0.05, HA: 0.05 },
  "JS (team)": { JS: 0.22, JR: 0.04, DR: 0.02, HA: 0.02 },
  "JR (SG)": { JS: 0.2, JR: 0.4, DR: 0.05, HA: 0.05 },
  "JR (PG)": { JS: 0.15, JR: 0.3, DR: 0.0375, HA: 0.0375 },
  "JR (SG/SF)": { JS: 0.15, JR: 0.3, DR: 0.0375, HA: 0.0375 },
  "JR (team)": { JS: 0.05, JR: 0.1, DR: 0.0125, HA: 0.0125 },
  "OD (PG)": { OD: 0.5, DR: 0.05, HA: 0.05, ID: 0.1 },
  "OD (PG/SG)": { OD: 0.375, DR: 0.0375, HA: 0.0375, ID: 0.075 },
  "OD(PG/SG/SF)": { OD: 0.2, DR: 0.02, HA: 0.02, ID: 0.04 },
  "HA (PG)": { OD: 0.1, DR: 0.5, HA: 0.4 },
  "HA (PG/SG)": { OD: 0.075, DR: 0.375, HA: 0.03 },
  "HA (PG/SG/SF)": { OD: 0.04, DR: 0.2, HA: 0.16 },
  "1v1 (PG/SG)": { JS: 0.4, DR: 0.4, HA: 0.5 },
  "1v1 (SF/PF)": { JS: 0.2, DR: 0.4, HA: 0.5, IS: 0.2 },
  "1v1 (team)": { JS: 0.088, DR: 0.176, HA: 0.22, IS: 0.088 },
  "PA (PG)": { DR: 0.16, HA: 0.16, PA: 0.6 },
  "PA (PG/SG)": { DR: 0.12, HA: 0.12, PA: 0.45 },
  "PA (team)": { DR: 0.04, HA: 0.04, PA: 0.15 },
  "IS (C)": { JS: 0.1, IS: 0.5, ID: 0.05 },
  "IS (PF/C)": { JS: 0.075, IS: 0.375, ID: 0.0375 },
  "IS (SF/PF/C)": { JS: 0.04, IS: 0.2, ID: 0.02 },
  "ID (C)": { IS: 0.05, ID: 0.5, SB: 0.1 },
  "ID (PF/C)": { IS: 0.0375, ID: 0.375, SB: 0.075 },
  "ID (SF/PF/C)": { IS: 0.02, ID: 0.2, SB: 0.04 },
  "RB (PF/C)": { IS: 0.05, ID: 0.05, REB: 0.5 },
  "RB (team)": { IS: 0.022, ID: 0.022, REB: 0.22 },
  "SB (C)": { ID: 0.2, RB: 0.1, SB: 0.5 },
  "SB (PF/C)": { ID: 0.15, RB: 0.075, SB: 0.0375 },
  "SB (team)": { ID: 0.08, RB: 0.04, SB: 0.2 }
};

const elasticEffects = {
  'JS->DR': 0.0211,
  'JR->OD': 0.0371,
  'OD->HA': 0.0332,
  'PA->HA': 0.04,
  'DR->JS': 0.0296,
  'DR->PA': 0.0129,
  'HA->OD': 0.0116,
  'HA->PA': 0.0103,
  'IS->JS': 0.0125,
  'IS->ID': 0.0289,
  'IS->RB': 0.0257,
  'ID->IS': 0.0153,
  'RB->ID': 0.0371,
  'SB->ID': 0.0197,
  'OD->ID': 0.0455
};

function getAgeCoefficient(age) {
  if (age <= 18) return 1.00;
  if (age === 19) return 0.95;
  if (age === 20) return 0.88;
  if (age === 21) return 0.78;
  if (age === 22) return 0.7;
  if (age === 23) return 0.6;
  if (age === 24) return 0.51;
  if (age === 25) return 0.42;
  if (age === 26) return 0.35;
  if (age === 27) return 0.27;
  if (age === 28) return 0.21;
  if (age === 29) return 0.16;
  if (age === 30) return 0.11;
  if (age === 31) return 0.07;
  if (age === 32) return 0.05;
  if (age === 33) return 0.03;
  if (age === 34) return 0.02;
  if (age === 35) return 0.01;
  return 0;
}

function simulateTraining() {
  const coachCoefficient = parseFloat(document.getElementById("coachQuality").value);
  const playerStats = {};
  baseStats.forEach(stat => {
    playerStats[stat] = parseFloat(document.getElementById(stat).value);
  });
  const baseAge = parseInt(document.getElementById("playerAge").value);
  const playerName = document.getElementById("playerName").value;


  for (let s = 1; s <= seasonCount; s++) {
    const selects = document.querySelectorAll(`#seasonBody${s} .training-select`);
    const age = parseInt(document.getElementById(`seasonAge${s}`).value);
    const ageCoefficient = getAgeCoefficient(age);

    selects.forEach(select => {
      const effect = trainingEffects[select.value];
      if (!effect) return;

      const currentGains = {}; // store base gains per stat before applying

      // Step 1: Calculate base gain per stat with coachCoefficient
      for (let stat in effect) {
        const baseGain = effect[stat] * ageCoefficient;
        const finalGain = baseGain * coachCoefficient;
        currentGains[stat] = finalGain;
      }

      // Step 2: Apply Elastic Effects (only if stat is a base in trainingEffect)
      for (let baseAttr in effect) {
        for (let key in elasticEffects) {
          const [elasticBase, elasticTarget] = key.split('->');

          if (elasticBase !== baseAttr) continue; // Only if this base is in the training type

          if (playerStats[elasticTarget] > playerStats[elasticBase]) {
            const diff = playerStats[elasticTarget] - playerStats[elasticBase];
            const multiplier = elasticEffects[key];
            const elasticFactor = diff * multiplier;
            const elasticGain = currentGains[baseAttr] * elasticFactor;
            currentGains[baseAttr] += elasticGain; // add elastic gain to baseAttr
          }
        }
      }

      // Step 3: Apply the gains to playerStats
      for (let stat in currentGains) {
        playerStats[stat] += currentGains[stat];
      }
    });
  }

  const resultRow = document.getElementById("resultRow");
  resultRow.innerHTML = baseStats.map(stat => `<td>${playerStats[stat].toFixed(2)}</td>`).join('');
  document.getElementById("playerSummary").textContent = `Player: ${playerName}`;
}

function applyTrainingToSeason(seasonNum) {
  const selected = document.getElementById(`seasonApplyAll${seasonNum}`).value;
  if (!selected) return;
  const selects = document.querySelectorAll(`#seasonBody${seasonNum} .training-select`);
  selects.forEach(sel => sel.value = selected);
}

function addSeason() {
  seasonCount++;
  const baseAge = parseInt(document.getElementById('playerAge').value);
  const container = document.getElementById('seasonsContainer');
  const seasonDiv = document.createElement('div');
  seasonDiv.id = `season${seasonCount}`;
  seasonDiv.classList.add('mt-5');
  const trainingOptions = Object.keys(trainingEffects).map(opt => `<option>${opt}</option>`).join('');

  seasonDiv.innerHTML = `
    <h5>Season ${seasonCount}</h5>
    <div class="mb-2">
      <label>Player Age for Season ${seasonCount}: </label>
      <input type="number" class="form-control d-inline-block w-auto ms-2" id="seasonAge${seasonCount}" value="${baseAge + (seasonCount - 1)}">
    </div>
    <div class="mb-3">
      <label>Apply training to all 14 weeks:</label>
      <select class="form-select form-select-sm d-inline-block w-auto" id="seasonApplyAll${seasonCount}">
        <option value="">-- Choose Training Type --</option>
        ${trainingOptions}
      </select>
      <button class="btn btn-sm btn-outline-primary ms-2" onclick="applyTrainingToSeason(${seasonCount})">Apply to All Weeks</button>
    </div>
    <table class="table table-bordered text-center align-middle">
      <thead class="table-light">
        <tr><th>Week</th><th>Training Type</th></tr>
      </thead>
      <tbody id="seasonBody${seasonCount}">
        ${Array.from({ length: 14 }, (_, i) => `
          <tr>
            <td>Week ${i + 1}</td>
            <td><select class="form-select form-select-sm training-select">${trainingOptions}</select></td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
  container.appendChild(seasonDiv);
}

function removeSeason() {
  if (seasonCount === 0) return;
  const lastSeason = document.getElementById(`season${seasonCount}`);
  if (lastSeason) lastSeason.remove();
  seasonCount--;
}

let seasonCount = 0;


const heightOptions = [
  "175cm", "178cm", "180cm", "183cm", "185cm", "188cm",
  "190cm", "193cm", "196cm", "198cm", "201cm", "203cm",
  "206cm", "208cm", "211cm", "213cm", "216cm", "218cm",
  "221cm", "224cm", "226cm", "229cm"
];

const potentialOptions = [
  "Speaker",
  "Reserva",
  "Jogador útil",
  "6º Homem",
  "Titular",
  "Estrela",
  "Super-estrela",
  "Vedeta",
  "Super-vedeta",
  "MVP",
  "Jogador Histórico",
  "Melhor jogador de sempre"
];

window.addEventListener('DOMContentLoaded', () => {
  populateStaticDropdowns();

  baseStats.forEach(stat => {
    const input = document.getElementById(stat);
    if (input) input.value = 7;
  });

  const nameInput = document.getElementById('playerName');
  if (nameInput) nameInput.value = 'name';
});

function populateStaticDropdowns() {
  const heightSelect = document.getElementById('height');
  const potentialSelect = document.getElementById('potential');

  if (heightSelect) {
    heightSelect.innerHTML = heightOptions.map(h => `<option value="${h}">${h}</option>`).join('');
    heightSelect.value = "185cm";
  }

  if (potentialSelect) {
    potentialSelect.innerHTML = potentialOptions.map(p => `<option value="${p}">${p}</option>`).join('');
    potentialSelect.value = "MVP";
  }
}
