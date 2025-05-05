// Fixed and refactored logic.js to correctly apply training effects including optional 'No Training' weeks

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
  "RB (PF/C)": { IS: 0.05, ID: 0.05, RB: 0.5 },
  "RB (team)": { IS: 0.022, ID: 0.022, RB: 0.22 },
  "SB (C)": { ID: 0.2, RB: 0.1, SB: 0.5 },
  "SB (PF/C)": { ID: 0.15, RB: 0.075, SB: 0.375 },
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
  const table = {
    18: 1.00, 19: 0.95, 20: 0.88, 21: 0.78, 22: 0.7, 23: 0.6, 24: 0.51,
    25: 0.42, 26: 0.35, 27: 0.27, 28: 0.21, 29: 0.16, 30: 0.11,
    31: 0.07, 32: 0.05, 33: 0.03, 34: 0.02, 35: 0.01
  };
  return table[age] || 0;
}

function simulateTraining() {
  const coachCoefficient = parseFloat(document.getElementById("coachQuality").value);
  const playerStats = {};
  baseStats.forEach(stat => {
    playerStats[stat] = parseFloat(document.getElementById(stat).value) || 0;
  });
  const playerName = document.getElementById("playerName").value;

  for (let s = 1; s <= seasonCount; s++) {
    const selects = document.querySelectorAll(`#seasonBody${s} .training-select`);
    const age = parseInt(document.getElementById(`seasonAge${s}`).value);
    const ageCoefficient = getAgeCoefficient(age);

    selects.forEach(select => {
      const effect = trainingEffects[select.value];
      if (!effect) return;

      const currentGains = {};
      for (let stat in effect) {
        currentGains[stat] = (effect[stat] * ageCoefficient) * coachCoefficient;
      }

      for (let stat in currentGains) {
        const baseAttr = stat;
        for (let key in elasticEffects) {
          const [elasticBase, elasticTarget] = key.split('->');
          if (elasticBase === baseAttr && playerStats[elasticTarget] > playerStats[elasticBase]) {
            const diff = playerStats[elasticTarget] - playerStats[elasticBase];
            const elasticFactor = diff * elasticEffects[key];
            currentGains[baseAttr] += currentGains[baseAttr] * elasticFactor;
          }
        }
      }

      for (let stat in currentGains) {
        playerStats[stat] += currentGains[stat];
      }
    });
  }

  const resultRow = document.getElementById("resultRow");
  resultRow.innerHTML = `<td>${playerName}</td>` + baseStats.map(stat => `<td>${playerStats[stat].toFixed(2)}</td>`).join('');
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

  // Build options
  const trainingOptionsList = Object.keys(trainingEffects).map(opt => `<option>${opt}</option>`).join('');
  const weekOptions = `<option value="">-- No Training --</option>` + trainingOptionsList;
  const applyAllOptions = `<option value="">-- Choose Training Type --</option>` + trainingOptionsList;

  seasonDiv.innerHTML = `
    <h5>Season ${seasonCount}</h5>
    <div class="mb-2">
      <label>Player Age for Season ${seasonCount}: </label>
      <input type="number" class="form-control d-inline-block w-auto ms-2" id="seasonAge${seasonCount}" value="${baseAge + (seasonCount - 1)}">
    </div>
    <div class="mb-3">
      <label>Apply training to all 14 weeks:</label>
      <select class="form-select form-select-sm d-inline-block w-auto" id="seasonApplyAll${seasonCount}">${applyAllOptions}</select>
      <button class="btn btn-sm btn-outline-primary ms-2" onclick="applyTrainingToSeason(${seasonCount})">Apply to All Weeks</button>
    </div>
    <table class="table table-bordered text-center align-middle">
      <thead class="table-light">
        <tr><th>Week</th><th>Training Type</th></tr>
      </thead>
      <tbody id="seasonBody${seasonCount}">
        ${Array.from({ length: 14 }, (_, i) =>
          `<tr>
            <td>Week ${i + 1}</td>
            <td><select class="form-select form-select-sm training-select">${weekOptions}</select></td>
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
  "Speaker", "Reserva", "Jogador útil", "6º Homem", "Titular", "Estrela",
  "Super-estrela", "Vedeta", "Super-vedeta", "MVP", "Jogador Histórico", "Melhor jogador de sempre"
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
