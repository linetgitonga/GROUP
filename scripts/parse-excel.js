const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const EXCEL = path.join(ROOT, 'Class Yearbook Profile and Memories Submission (Responses).xlsx');
const IMG_DIR = path.join(ROOT, 'img');
const OUT = path.join(ROOT, 'data', 'class.json');

const imgExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const imageFiles = fs.readdirSync(IMG_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return imgExts.includes(ext);
});

function normalise(str) {
    return str.toLowerCase().replace(/[^a-z]/g, '');
}

const manualMap = {
    'brian kasina': 'img/kasina3.jpeg',
    'sharleen kariuki': 'img/WhatsApp Image 2026-07-09 at 1.13.34 PM - Sharleen Kariuki.jpeg',
    'stephen kiruri kariuki': 'img/IMG_20250906_090930_673 - Kariuki Kiruri.jpg',
    'abigael mbugua': 'img/IMG-20260704-WA0125 - Pep Mbugua.jpg',
    'mark gichora': 'img/mypic2 - Mark William.jpg',
    'cyprian kings': 'img/IMG-20250120-WA0019 - Cyprian Kiama.jpg',
    'harrison kirigwi': 'img/7881924ff1ad6363ac562ca2658fd8ae - Harrison Ng_ang_a.png',
    'imani lishati muchera': 'img/20260429_151109 - Imani.jpg',
    'jobrian kipkemoi just': 'img/IMG_20260702_131744_731 - Jay Kipkemoi.jpg',
    'ovedje-eyuren gabriel': 'img/IMG_7743 - Eyuren Gabriel.jpeg',
    'stanley ndegwa': 'img/IMG_20250222_213040 - Stanley Mwangi.jpg',
    'thuku samuel karanja': 'img/CLY_0638 - Thuku Sk.jpg',
};

function findImage(fullName) {
    const lower = fullName.trim().toLowerCase();
    if (manualMap[lower]) return manualMap[lower];

    const nameParts = fullName.trim().split(/\s+/).filter(p => p.length > 1);
    const normName = normalise(fullName);

    let bestMatch = null;
    let bestScore = 0;

    for (const file of imageFiles) {
        const afterDash = file.split(' - ').slice(1).join(' - ');
        if (!afterDash) continue;
        const imgName = afterDash.replace(/\.[^.]+$/, '');
        const normImg = normalise(imgName);

        if (normImg === normName) return 'img/' + file;

        const imgParts = imgName.trim().split(/[\s_]+/).filter(p => p.length > 1);
        let matchCount = 0;
        for (const np of nameParts) {
            for (const ip of imgParts) {
                if (normalise(np) === normalise(ip)) { matchCount++; break; }
            }
        }
        const score = matchCount / Math.max(nameParts.length, imgParts.length);
        if (matchCount >= 2 && score > bestScore) {
            bestScore = score;
            bestMatch = 'img/' + file;
        }
    }

    return bestMatch;
}

const wb = XLSX.readFile(EXCEL);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws);

const seen = new Set();
const people = [];

for (const row of rows) {
    const name = (row['Full Name 👨‍💻👩‍💻'] || '').trim();
    if (!name) continue;

    const key = normalise(name);
    if (seen.has(key)) continue;
    seen.add(key);

    const nickname = (row['Nickname 😉'] || '').trim();
    const specialization = (row['Specialization in final year'] || '').trim();
    const bio = (row['A brief description about yourself 🥳🥳🥳'] || '').trim();
    const kindWord = (row['A kind word to the class 💖'] || '').trim();
    const image = findImage(name);

    people.push({
        name,
        nickname: nickname === 'undefined' ? '' : nickname,
        specialization,
        bio,
        kindWord,
        image
    });
}

// Manual additions (not in Excel)
const manualAdditions = [
    {
        name: 'Linet Muthoni',
        nickname: 'class rep',
        specialization: 'netcentric',
        bio: 'I am someone who easily learns listens cares all rounded',
        kindWord: "Let's be honest with each other. You have been very difficult people to deal with.Truly. Spectacularly. Consistently.Somehow, through the chaos, the all-nighters, the endless debugging sessions, and the shared suffering of that one unit we all pretend we've forgotten... we made it",
        image: 'img/DINNER-369 (1).jpg'
    },
    {
        name: 'Paul',
        nickname: '',
        specialization: '',
        bio: '',
        kindWord: '',
        image: null
    }
];
manualAdditions.forEach(entry => {
    const exists = people.some(p => normalise(p.name) === normalise(entry.name));
    if (!exists) people.push(entry);
});

people.sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(people, null, 2), 'utf8');

console.log(`Parsed ${people.length} people → ${OUT}`);
people.forEach(p => {
    const status = p.image ? '✔' : '✘ NO IMAGE';
    console.log(`  ${status}  ${p.name}  →  ${p.image || 'placeholder'}`);
});
