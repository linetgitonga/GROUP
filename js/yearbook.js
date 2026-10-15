/* ============================================
   CS 2026 YEARBOOK — Main Interactive Script
   ============================================ */

(function () {
    'use strict';

    // ── Data ──
    let classData = [];
    const FUN_LABELS = [
        "Final Boss of Group Projects", "3AM Debugger", "Stack Overflow Scholar",
        "Git Commit Champion", "The Human Compiler", "Ctrl+Z Specialist",
        "Semicolon Whisperer", "Loop Legend", "Array Avenger", "Bug Bounty Hunter",
        "WiFi Warrior", "Caffeine-Powered Coder", "Deadline Defier", "The Merge Conflict Survivor",
        "Pull Request Pro", "Sudo Supreme", "The CSS Wizard", "API Alchemist",
        "The Database Whisperer", "Recursion Master", "The Hackathon Hero",
        "Code Review Connoisseur", "The Pixel Perfectionist", "Algorithm Ace",
        "Cloud Commander", "Docker Dynamo", "Regex Ruler", "Terminal Titan",
        "The Test Case Tactician", "Exception Handler Extraordinaire"
    ];

    const GRADUATION_DATE = new Date('2026-12-18T10:00:00+03:00');

    function hashName(name) {
        let h = 0;
        for (let i = 0; i < name.length; i++) {
            h = ((h << 5) - h) + name.charCodeAt(i);
            h |= 0;
        }
        return Math.abs(h);
    }

    function getFunLabel(name) {
        return FUN_LABELS[hashName(name) % FUN_LABELS.length];
    }

    function getInitials(name) {
        return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    function createImgOrPlaceholder(person, cls) {
        if (person.image) {
            return '<img src="' + encodeURI(person.image) + '" alt="' + escapeHtml(person.name) + '" class="' + (cls || '') + '" loading="lazy">';
        }
        return '<div class="avatar-placeholder ' + (cls || '') + '">' + getInitials(person.name) + '</div>';
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    // ── Theme Toggle ──
    function initTheme() {
        var saved;
        try { saved = localStorage.getItem('yb-theme'); } catch (e) {}
        var theme = saved || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);

        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme');
                var next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                try { localStorage.setItem('yb-theme', next); } catch (e) {}
                updateThemeIcon(next);
            });
        }
    }

    function updateThemeIcon(theme) {
        var icon = document.getElementById('theme-icon');
        if (!icon) return;
        icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
    }

    // ── Countdown ──
    function initCountdown() {
        function tick() {
            var now = new Date();
            var diff = GRADUATION_DATE - now;
            if (diff <= 0) {
                var el = document.getElementById('graduation-countdown');
                if (el) el.innerHTML = '<div style="font-size:2rem;color:#fff;"><i class="fa fa-graduation-cap me-2"></i>Graduation Day is Here! <i class="fa fa-party-horn"></i></div>';
                launchConfetti();
                return;
            }
            var d = Math.floor(diff / 86400000);
            var h = Math.floor((diff % 86400000) / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            var de = document.getElementById('cd-days');
            var he = document.getElementById('cd-hours');
            var me = document.getElementById('cd-mins');
            var se = document.getElementById('cd-secs');
            if (de) de.textContent = d;
            if (he) he.textContent = h;
            if (me) me.textContent = m;
            if (se) se.textContent = s;
            requestAnimationFrame(tick);
        }
        if (document.getElementById('cd-days')) tick();
    }

    // ── Matrix Rain ──
    function initMatrix() {
        var canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var cols = Math.floor(canvas.width / 16);
        var drops = Array(cols).fill(1);
        var chars = '01アイウエオカキクケコ{}[]<>/=;:const let var function if else return'.split('');

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#E41779';
            ctx.font = '14px monospace';
            for (var i = 0; i < drops.length; i++) {
                var text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 16, drops[i] * 16);
                if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        setInterval(draw, 50);
        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // ── Profile Card HTML ──
    function buildProfileCard(person, index) {
        var label = getFunLabel(person.name);
        var imgHtml;
        if (person.image) {
            imgHtml = '<img src="' + encodeURI(person.image) + '" alt="' + escapeHtml(person.name) + '" loading="lazy">';
        } else {
            imgHtml = '<div class="avatar-placeholder">' + getInitials(person.name) + '</div>';
        }

        return '<div class="col-xl-3 col-lg-4 col-md-4 col-6 person-item" data-name="' + escapeHtml(person.name.toLowerCase()) + '" data-spec="' + escapeHtml((person.specialization || '').toLowerCase()) + '" data-index="' + index + '">' +
            '<div class="profile-card" onclick="window.YB.openModal(' + index + ')">' +
                '<div class="card-img-wrap">' + imgHtml + '</div>' +
                '<div class="card-body">' +
                    '<div class="card-name">' + escapeHtml(person.name) + '</div>' +
                    '<div class="card-label">' + escapeHtml(label) + '</div>' +
                    (person.specialization ? '<div class="card-spec">' + escapeHtml(person.specialization) + '</div>' : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }

    // ── People Grid ──
    function initPeopleGrid() {
        var grid = document.getElementById('people-grid');
        if (!grid) return;

        var specSet = new Set();
        classData.forEach(function (p) {
            if (p.specialization) specSet.add(p.specialization.toLowerCase());
        });

        var filterContainer = document.getElementById('filter-buttons');
        if (filterContainer) {
            specSet.forEach(function (spec) {
                var btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.setAttribute('data-filter', spec);
                btn.textContent = spec.charAt(0).toUpperCase() + spec.slice(1);
                filterContainer.appendChild(btn);
            });
        }

        renderPeopleGrid(classData);

        var search = document.getElementById('people-search');
        if (search) {
            search.addEventListener('input', function () {
                var q = this.value.toLowerCase().trim();
                var items = grid.querySelectorAll('.person-item');
                items.forEach(function (item) {
                    var name = item.getAttribute('data-name');
                    item.style.display = name.indexOf(q) !== -1 ? '' : 'none';
                });
            });
        }

        if (filterContainer) {
            filterContainer.addEventListener('click', function (e) {
                if (!e.target.classList.contains('filter-btn')) return;
                filterContainer.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
                e.target.classList.add('active');
                var filter = e.target.getAttribute('data-filter');

                if (filter === 'all') {
                    renderPeopleGrid(classData);
                } else if (filter === 'alpha') {
                    var sorted = classData.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
                    renderPeopleGrid(sorted);
                } else if (filter === 'shuffle') {
                    var shuffled = classData.slice();
                    for (var i = shuffled.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
                    }
                    renderPeopleGrid(shuffled);
                } else {
                    var filtered = classData.filter(function (p) { return (p.specialization || '').toLowerCase() === filter; });
                    renderPeopleGrid(filtered);
                }
            });
        }
    }

    function renderPeopleGrid(data) {
        var grid = document.getElementById('people-grid');
        if (!grid) return;
        grid.innerHTML = data.map(function (p) {
            var idx = classData.indexOf(p);
            return buildProfileCard(p, idx);
        }).join('');
    }

    // ── Yearbook Sections ──
    function buildBookEntry(person, idx) {
        var label = getFunLabel(person.name);
        var imgHtml;
        if (person.image) {
            imgHtml = '<img src="' + encodeURI(person.image) + '" alt="' + escapeHtml(person.name) + '" loading="lazy">';
        } else {
            imgHtml = '<div class="avatar-placeholder" style="width:70px;height:70px;border-radius:8px;font-size:1.2rem;display:inline-flex;">' + getInitials(person.name) + '</div>';
        }
        return '<div class="yb-profile-entry" onclick="window.YB.openModal(' + idx + ')">' +
            imgHtml +
            '<div class="yb-entry-info">' +
                '<div class="yb-entry-name">' + escapeHtml(person.name) + '</div>' +
                '<div class="yb-entry-label">' + escapeHtml(label) + '</div>' +
                (person.nickname ? '<div class="yb-entry-nickname">"' + escapeHtml(person.nickname) + '"</div>' : '') +
            '</div>' +
        '</div>';
    }

    function initYearbook() {
        var container = document.getElementById('yearbook-container');
        if (!container) return;

        var groups = {};
        classData.forEach(function (p, idx) {
            var spec = (p.specialization || 'Other').toLowerCase();
            var key = spec.charAt(0).toUpperCase() + spec.slice(1);
            if (!groups[key]) groups[key] = [];
            groups[key].push({ person: p, idx: idx });
        });

        var html = '<div class="yearbook-book">';
        var pageNum = 1;
        var groupNames = Object.keys(groups).sort();

        groupNames.forEach(function (groupName, gi) {
            var members = groups[groupName];
            var perPage = 4;
            var pages = [];
            for (var i = 0; i < members.length; i += perPage) {
                pages.push(members.slice(i, i + perPage));
            }

            for (var pi = 0; pi < pages.length; pi += 2) {
                html += '<div class="yb-spread">';

                // Left page
                html += '<div class="yb-page yb-page-left">';
                if (pi === 0) {
                    html += '<div class="yb-section-title"><i class="fa fa-bookmark me-2"></i>' + escapeHtml(groupName) + '</div>';
                }
                pages[pi].forEach(function (item) {
                    html += buildBookEntry(item.person, item.idx);
                });
                html += '<div class="yb-page-number">' + pageNum + '</div>';
                html += '</div>';
                pageNum++;

                // Right page
                html += '<div class="yb-page yb-page-right">';
                if (pi + 1 < pages.length) {
                    pages[pi + 1].forEach(function (item) {
                        html += buildBookEntry(item.person, item.idx);
                    });
                } else if (gi + 1 < groupNames.length) {
                    html += '<div style="display:flex;align-items:center;justify-content:center;height:100%;opacity:0.3;"><i class="fa fa-arrow-right" style="font-size:2rem;"></i></div>';
                }
                html += '<div class="yb-page-number">' + pageNum + '</div>';
                html += '</div>';
                pageNum++;

                html += '</div>';
            }
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // ── Modal ──
    function openModal(index) {
        var p = classData[index];
        if (!p) return;

        document.getElementById('modal-name').textContent = p.name;
        var imgC = document.getElementById('modal-img-container');
        if (p.image) {
            imgC.innerHTML = '<img src="' + encodeURI(p.image) + '" alt="' + escapeHtml(p.name) + '" class="modal-profile-img">';
        } else {
            imgC.innerHTML = '<div class="avatar-placeholder modal-profile-img" style="width:200px;height:200px;border-radius:50%;font-size:3rem;display:inline-flex;">' + getInitials(p.name) + '</div>';
        }
        document.getElementById('modal-nickname').textContent = p.nickname ? '"' + p.nickname + '"' : '';
        document.getElementById('modal-spec').textContent = p.specialization || '';
        document.getElementById('modal-bio').textContent = p.bio || '';
        document.getElementById('modal-kindword').textContent = p.kindWord ? '"' + p.kindWord + '"' : '';

        loadSignedMessages(p.name);

        var modal = new bootstrap.Modal(document.getElementById('profileModal'));
        modal.show();

        var signBtn = document.getElementById('sign-btn');
        var cloned = signBtn.cloneNode(true);
        signBtn.parentNode.replaceChild(cloned, signBtn);
        cloned.id = 'sign-btn';
        cloned.addEventListener('click', function () {
            var textarea = document.getElementById('sign-msg');
            var msg = textarea.value.trim();
            if (!msg) return;
            saveSignedMessage(p.name, msg);
            textarea.value = '';
            loadSignedMessages(p.name);
        });
    }

    function saveSignedMessage(name, msg) {
        try {
            var key = 'yb-sign-' + name;
            var msgs = JSON.parse(localStorage.getItem(key) || '[]');
            msgs.push({ text: msg, time: new Date().toISOString() });
            localStorage.setItem(key, JSON.stringify(msgs));
        } catch (e) {}
    }

    function loadSignedMessages(name) {
        var container = document.getElementById('signed-messages');
        if (!container) return;
        try {
            var key = 'yb-sign-' + name;
            var msgs = JSON.parse(localStorage.getItem(key) || '[]');
            container.innerHTML = msgs.map(function (m) {
                return '<div class="signed-msg">' + escapeHtml(m.text) + '<div style="font-size:0.7rem;color:var(--yb-muted);margin-top:0.25rem;">' + new Date(m.time).toLocaleDateString() + '</div></div>';
            }).join('');
        } catch (e) {
            container.innerHTML = '';
        }
    }

    // ── Guestbook ──
    function initGuestbook() {
        var submit = document.getElementById('gb-submit');
        if (!submit) return;

        loadGuestbook();

        submit.addEventListener('click', function () {
            var nameInput = document.getElementById('gb-name');
            var msgInput = document.getElementById('gb-message');
            var name = nameInput.value.trim();
            var msg = msgInput.value.trim();
            if (!name || !msg) return;

            submit.disabled = true;
            fetch('/api/guestbook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, message: msg })
            }).then(function () {
                nameInput.value = '';
                msgInput.value = '';
                submit.disabled = false;
                loadGuestbook();
            }).catch(function () {
                submit.disabled = false;
                alert('Could not post — is the server running?');
            });
        });
    }

    function loadGuestbook() {
        var wall = document.getElementById('sticky-wall');
        if (!wall) return;
        fetch('/api/guestbook').then(function (r) { return r.json(); }).then(function (entries) {
            wall.innerHTML = entries.map(function (e) {
                return '<div class="sticky-note">' +
                    '<div class="note-author">' + escapeHtml(e.name) + '</div>' +
                    '<div class="note-body">' + escapeHtml(e.message) + '</div>' +
                    '<div class="note-time">' + new Date(e.created_at + 'Z').toLocaleDateString() + '</div>' +
                '</div>';
            }).join('');
        }).catch(function () {
            wall.innerHTML = '<p style="color:var(--yb-muted);text-align:center;">Could not load guestbook entries.</p>';
        });
    }

    // ── Confetti ──
    function launchConfetti() {
        var colors = ['#E41779', '#F0A500', '#198754', '#0dcaf0', '#ffc107', '#dc3545'];
        for (var i = 0; i < 100; i++) {
            var el = document.createElement('div');
            el.className = 'confetti-piece';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-10px';
            el.style.background = colors[Math.floor(Math.random() * colors.length)];
            el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            el.style.animationDelay = Math.random() * 2 + 's';
            el.style.animationDuration = 2 + Math.random() * 2 + 's';
            document.body.appendChild(el);
            setTimeout(function (e) { e.remove(); }.bind(null, el), 5000);
        }
    }

    // ═══════════════════════════════════════════
    //  FUN ZONE GAMES
    // ═══════════════════════════════════════════

    function backToMenu() {
        document.getElementById('funzone-menu').style.display = '';
        document.getElementById('game-area').style.display = 'none';
    }

    function loadGame(game) {
        document.getElementById('funzone-menu').style.display = 'none';
        document.getElementById('game-area').style.display = '';
        var gc = document.getElementById('game-container');

        switch (game) {
            case 'spin': initSpinWheel(gc); break;
            case 'guess': initGuessWho(gc); break;
            case 'poll': initPoll(gc); break;
            case 'memory': initMemoryMatch(gc); break;
            case 'quiz': initQuiz(gc); break;
            case 'bingo': initBingo(gc); break;
            case 'countdown': initCountdownGame(gc); break;
        }
    }

    // ── 1. Spin the Wheel ──
    function initSpinWheel(gc) {
        var people = classData.filter(function (p) { return p.image; });
        if (people.length < 2) people = classData;

        gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-circle-notch me-2"></i>Spin the Wheel</h2><p style="color:var(--yb-muted);">Click SPIN to pick a random classmate!</p></div>' +
            '<div class="wheel-wrapper"><div class="wheel-pointer">▼</div><canvas id="spin-canvas" width="320" height="320"></canvas><button class="spin-btn" id="spin-go">SPIN</button></div>' +
            '<div id="spin-result" style="text-align:center;margin-top:2rem;"></div>';

        var canvas = document.getElementById('spin-canvas');
        var ctx = canvas.getContext('2d');
        var total = Math.min(people.length, 12);
        var sliceAngle = (2 * Math.PI) / total;
        var rotation = 0;
        var spinning = false;
        var colors = ['#E41779', '#F0A500', '#198754', '#0dcaf0', '#6f42c1', '#fd7e14', '#20c997', '#d63384', '#0d6efd', '#ffc107', '#dc3545', '#6610f2'];

        function drawWheel() {
            ctx.clearRect(0, 0, 320, 320);
            for (var i = 0; i < total; i++) {
                var start = rotation + i * sliceAngle;
                var end = start + sliceAngle;
                ctx.beginPath();
                ctx.moveTo(160, 160);
                ctx.arc(160, 160, 150, start, end);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.save();
                ctx.translate(160, 160);
                ctx.rotate(start + sliceAngle / 2);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Work Sans, sans-serif';
                ctx.textAlign = 'left';
                var displayName = people[i].name.split(' ').slice(0, 2).join(' ');
                ctx.fillText(displayName, 40, 4);
                ctx.restore();
            }
        }

        drawWheel();

        document.getElementById('spin-go').addEventListener('click', function () {
            if (spinning) return;
            spinning = true;
            var targetAngle = rotation + Math.PI * (6 + Math.random() * 6);
            var start = performance.now();
            var duration = 4000;
            var startRot = rotation;

            function animate(now) {
                var elapsed = now - start;
                var progress = Math.min(elapsed / duration, 1);
                var ease = 1 - Math.pow(1 - progress, 3);
                rotation = startRot + (targetAngle - startRot) * ease;
                drawWheel();
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    spinning = false;
                    var normalizedAngle = (2 * Math.PI - (rotation % (2 * Math.PI)) + Math.PI * 1.5) % (2 * Math.PI);
                    var winner = Math.floor(normalizedAngle / sliceAngle) % total;
                    var p = people[winner];
                    var resultDiv = document.getElementById('spin-result');
                    resultDiv.innerHTML = '<h3 style="color:var(--yb-gold);">Today\'s Spotlight</h3>' +
                        '<div style="margin:1rem auto;">' + createImgOrPlaceholder(p, 'guess-photo') + '</div>' +
                        '<h4>' + escapeHtml(p.name) + '</h4>' +
                        '<p style="color:var(--yb-primary);font-style:italic;">' + escapeHtml(getFunLabel(p.name)) + '</p>';
                    launchConfetti();
                }
            }
            requestAnimationFrame(animate);
        });
    }

    // ── 2. Guess Who? ──
    function initGuessWho(gc) {
        var withImg = classData.filter(function (p) { return p.image; });
        if (withImg.length < 4) { gc.innerHTML = '<p>Need at least 4 people with photos to play.</p>'; return; }

        var score = 0, streak = 0, round = 0;
        var bestScore = 0, bestStreak = 0;
        try { bestScore = parseInt(localStorage.getItem('yb-guess-best') || '0'); } catch (e) {}
        try { bestStreak = parseInt(localStorage.getItem('yb-guess-streak') || '0'); } catch (e) {}

        function nextRound() {
            round++;
            var shuffled = withImg.slice().sort(function () { return Math.random() - 0.5; });
            var correct = shuffled[0];
            var options = shuffled.slice(0, 4).sort(function () { return Math.random() - 0.5; });

            gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-magnifying-glass me-2"></i>Guess Who?</h2>' +
                '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem;">' +
                '<span class="game-score">Score: ' + score + '</span>' +
                '<span class="game-score">Streak: ' + streak + ' <i class="fa fa-fire"></i></span>' +
                '<span class="game-score">Round: ' + round + '</span>' +
                '<span class="game-score" style="color:var(--yb-gold);"><i class="fa fa-trophy me-1"></i>Best: ' + bestScore + '</span>' +
                '<span class="game-score" style="color:var(--yb-gold);"><i class="fa fa-fire me-1"></i>Best Streak: ' + bestStreak + '</span>' +
                '</div></div>' +
                '<img src="' + encodeURI(correct.image) + '" alt="Who is this?" class="guess-photo">' +
                '<div class="guess-options" id="guess-options"></div>';

            var optionsDiv = document.getElementById('guess-options');
            options.forEach(function (p) {
                var btn = document.createElement('button');
                btn.className = 'guess-btn';
                btn.textContent = p.name;
                btn.addEventListener('click', function () {
                    var btns = optionsDiv.querySelectorAll('.guess-btn');
                    btns.forEach(function (b) { b.style.pointerEvents = 'none'; });
                    if (p.name === correct.name) {
                        btn.classList.add('correct');
                        score++;
                        streak++;
                        if (score > bestScore) { bestScore = score; try { localStorage.setItem('yb-guess-best', bestScore); } catch (e) {} }
                        if (streak > bestStreak) { bestStreak = streak; try { localStorage.setItem('yb-guess-streak', bestStreak); } catch (e) {} }
                    } else {
                        btn.classList.add('wrong');
                        streak = 0;
                        btns.forEach(function (b) {
                            if (b.textContent === correct.name) b.classList.add('correct');
                        });
                    }
                    setTimeout(nextRound, 1500);
                });
                optionsDiv.appendChild(btn);
            });
        }

        nextRound();
    }

    // ── 3. Most Likely To ──
    function initPoll(gc) {
        var questions = [
            "Most likely to debug at 3 AM",
            "Most likely to become a CEO",
            "Most likely to sleep through a lecture",
            "Most likely to ace every exam without studying",
            "Most likely to start a tech startup",
            "Most likely to still be coding at 80",
            "Most likely to forget their laptop charger",
            "Most likely to automate their daily life",
            "Most likely to write a bestselling novel",
            "Most likely to become a professor"
        ];
        var currentQ = 0;
        var allVotes = {};
        var useApi = true;

        fetch('/api/votes').then(function (r) {
            if (!r.ok) throw new Error('no api');
            return r.json();
        }).then(function (rows) {
            rows.forEach(function (r) {
                if (!allVotes[r.question]) allVotes[r.question] = {};
                allVotes[r.question][r.pick] = r.count;
            });
            showQuestion();
        }).catch(function () { useApi = false; showQuestion(); });

        function showQuestion() {
            if (currentQ >= questions.length) {
                showFinalResults();
                return;
            }

            var q = questions[currentQ];
            var candidates = classData.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 6);
            var voteKey = 'yb-poll-' + currentQ;
            var voted = false;
            try { voted = localStorage.getItem(voteKey); } catch (e) {}

            gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-square-poll-vertical me-2"></i>Most Likely To...</h2><p style="color:var(--yb-muted);">Question ' + (currentQ + 1) + ' of ' + questions.length + '</p></div>' +
                '<div class="poll-question">' + escapeHtml(q) + '</div>' +
                '<div class="poll-options" id="poll-options"></div>' +
                '<div style="text-align:center;margin-top:2rem;"><button class="btn btn-outline-primary border-2" id="poll-next" style="display:none;">Next Question <i class="fa fa-arrow-right ms-1"></i></button></div>';

            var optionsDiv = document.getElementById('poll-options');

            candidates.forEach(function (p) {
                var opt = document.createElement('div');
                opt.className = 'poll-option';
                opt.innerHTML = createImgOrPlaceholder(p, '') + '<span style="flex:1;">' + escapeHtml(p.name) + '</span>';
                if (!voted) {
                    opt.addEventListener('click', function () {
                        try { localStorage.setItem(voteKey, p.name); } catch (e) {}
                        if (useApi) {
                            fetch('/api/vote', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ question: q, pick: p.name })
                            }).then(function () {
                                return fetch('/api/votes/' + encodeURIComponent(q));
                            }).then(function (r) { return r.json(); }).then(function (rows) {
                                showResults(rows);
                            }).catch(function () { showLocalResult(p.name, candidates); });
                        } else {
                            showLocalResult(p.name, candidates);
                        }
                    });
                }
                optionsDiv.appendChild(opt);
            });

            if (voted) {
                if (useApi) {
                    fetch('/api/votes/' + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (rows) {
                        showResults(rows);
                    }).catch(function () { showLocalResult(voted, candidates); });
                } else {
                    showLocalResult(voted, candidates);
                }
            }

            document.getElementById('poll-next').addEventListener('click', function () {
                currentQ++;
                showQuestion();
            });
        }

        function showLocalResult(votedName, candidates) {
            var optionsDiv = document.getElementById('poll-options');
            optionsDiv.innerHTML = '';
            candidates.forEach(function (p) {
                var opt = document.createElement('div');
                opt.className = 'poll-option';
                opt.style.cursor = 'default';
                var isVoted = p.name === votedName;
                opt.innerHTML = createImgOrPlaceholder(p, '') +
                    '<span style="flex:1;">' + escapeHtml(p.name) + '</span>' +
                    (isVoted ? '<span style="color:var(--yb-gold);font-weight:700;"><i class="fa fa-check me-1"></i>Your pick</span>' : '');
                optionsDiv.appendChild(opt);
            });
            document.getElementById('poll-next').style.display = '';
        }

        function showResults(rows) {
            var optionsDiv = document.getElementById('poll-options');
            var maxVotes = 1;
            rows.forEach(function (r) { if (r.count > maxVotes) maxVotes = r.count; });

            optionsDiv.innerHTML = '';
            rows.forEach(function (r) {
                var pct = Math.round((r.count / maxVotes) * 100);
                var opt = document.createElement('div');
                opt.className = 'poll-option';
                opt.style.cursor = 'default';
                var person = classData.find(function (p) { return p.name === r.pick; });
                opt.innerHTML = (person ? createImgOrPlaceholder(person, '') : '') +
                    '<span style="flex:0 0 auto;min-width:120px;">' + escapeHtml(r.pick) + '</span>' +
                    '<div class="poll-bar-container"><div class="poll-bar" style="width:' + pct + '%;">' + r.count + ' vote' + (r.count !== 1 ? 's' : '') + '</div></div>';
                optionsDiv.appendChild(opt);
            });

            document.getElementById('poll-next').style.display = '';
        }

        function showFinalResults() {
            fetch('/api/votes').then(function (r) { return r.json(); }).then(function (rows) {
                var winners = {};
                rows.forEach(function (r) {
                    if (!winners[r.question] || r.count > winners[r.question].count) {
                        winners[r.question] = { pick: r.pick, count: r.count };
                    }
                });
                var html = '<div class="game-header"><h2><i class="fa fa-trophy me-2"></i>Poll Results</h2><p>Here\'s what the class voted!</p></div>';
                html += '<div style="max-width:600px;margin:0 auto;">';
                questions.forEach(function (q) {
                    var w = winners[q];
                    html += '<div style="background:var(--yb-surface);border:1px solid var(--yb-border);border-radius:12px;padding:1rem 1.5rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;">';
                    html += '<div style="flex:1;"><div style="color:var(--yb-muted);font-size:0.85rem;">' + escapeHtml(q) + '</div>';
                    if (w) {
                        html += '<div style="font-weight:700;color:var(--yb-gold);font-size:1.1rem;">' + escapeHtml(w.pick) + ' <span style="font-weight:400;font-size:0.85rem;color:var(--yb-muted);">(' + w.count + ' votes)</span></div>';
                    } else {
                        html += '<div style="color:var(--yb-muted);">No votes yet</div>';
                    }
                    html += '</div></div>';
                });
                html += '</div><div style="text-align:center;margin-top:2rem;"><button class="btn btn-primary" onclick="window.YB.loadGame(\'poll\')">Vote Again</button></div>';
                gc.innerHTML = html;
            }).catch(function () {
                gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-square-poll-vertical me-2"></i>Thanks for Voting!</h2></div>';
            });
        }
    }

    // ── 4. Memory Match ──
    function initMemoryMatch(gc) {
        var withImg = classData.filter(function (p) { return p.image; });
        var selected = withImg.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 6);
        var cards = [];
        selected.forEach(function (p) {
            cards.push({ type: 'photo', person: p, id: p.name });
            cards.push({ type: 'name', person: p, id: p.name });
        });
        for (var i = cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
        }

        var moves = 0, matched = 0, flipped = [], locked = false;
        var totalPairs = selected.length;

        gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-brain me-2"></i>Memory Match</h2>' +
            '<div><span class="game-score" id="mm-moves">Moves: 0</span><span class="game-score" id="mm-matched">Matched: 0/' + totalPairs + '</span></div></div>' +
            '<div class="memory-grid" id="mm-grid"></div>';

        var grid = document.getElementById('mm-grid');
        cards.forEach(function (card, idx) {
            var el = document.createElement('div');
            el.className = 'memory-card';
            el.setAttribute('data-id', card.id);
            el.setAttribute('data-idx', idx);

            var backContent;
            if (card.type === 'photo') {
                backContent = '<img src="' + encodeURI(card.person.image) + '" alt="' + escapeHtml(card.person.name) + '">';
            } else {
                backContent = '<div class="mem-name">' + escapeHtml(card.person.name) + '</div>';
            }

            el.innerHTML = '<div class="memory-card-inner"><div class="memory-card-front">?</div><div class="memory-card-back">' + backContent + '</div></div>';

            el.addEventListener('click', function () {
                if (locked || el.classList.contains('flipped') || el.classList.contains('matched')) return;
                el.classList.add('flipped');
                flipped.push(el);

                if (flipped.length === 2) {
                    moves++;
                    document.getElementById('mm-moves').textContent = 'Moves: ' + moves;
                    locked = true;
                    var a = flipped[0], b = flipped[1];
                    if (a.getAttribute('data-id') === b.getAttribute('data-id') && a.getAttribute('data-idx') !== b.getAttribute('data-idx')) {
                        a.classList.add('matched');
                        b.classList.add('matched');
                        matched++;
                        document.getElementById('mm-matched').textContent = 'Matched: ' + matched + '/' + totalPairs;
                        flipped = [];
                        locked = false;
                        if (matched === totalPairs) {
                            setTimeout(function () {
                                gc.innerHTML += '<div style="text-align:center;margin-top:2rem;"><h3 style="color:var(--yb-gold);"><i class="fa fa-trophy me-2"></i>You Won in ' + moves + ' moves!</h3><button class="btn btn-primary mt-2" onclick="window.YB.loadGame(\'memory\')">Play Again</button></div>';
                                launchConfetti();
                            }, 500);
                        }
                    } else {
                        setTimeout(function () {
                            a.classList.remove('flipped');
                            b.classList.remove('flipped');
                            flipped = [];
                            locked = false;
                        }, 1000);
                    }
                }
            });

            grid.appendChild(el);
        });
    }

    // ── 5. Which Classmate Are You? ──
    function initQuiz(gc) {
        // Each option maps to a personality trait: [leader, creative, social, analytical]
        var questions = [
            { q: "It's Friday night. What are you doing?",
              opts: ["Leading a hackathon team", "Working on a creative side project", "Out with the squad", "Deep-diving into documentation"],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "Your approach to a group project?",
              opts: ["Assign tasks and set deadlines", "Design the UI and make it beautiful", "Keep everyone motivated and connected", "Write the core logic and test cases"],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "Pick a tech role you'd thrive in:",
              opts: ["CTO / Engineering Manager", "UX Designer / Frontend Dev", "Developer Relations / Community", "Backend Engineer / Data Scientist"],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "How do you handle a deadline crunch?",
              opts: ["Rally the team and delegate", "Find an elegant shortcut", "Order pizza and make it a party", "Plan every remaining hour carefully"],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "Your classmates come to you when they need...",
              opts: ["Someone to take charge", "A fresh perspective or idea", "Emotional support or a laugh", "A clear, logical explanation"],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "Pick a quote that speaks to you:",
              opts: ["\"The best way to predict the future is to create it\"", "\"Think different\"", "\"Alone we can do so little; together we can do so much\"", "\"In God we trust; all others must bring data\""],
              traits: ["leader", "creative", "social", "analytical"] },
            { q: "What matters most in your career?",
              opts: ["Impact and influence", "Freedom to innovate", "Great people around me", "Solving hard problems"],
              traits: ["leader", "creative", "social", "analytical"] }
        ];
        var traitScores = { leader: 0, creative: 0, social: 0, analytical: 0 };
        var currentQ = 0;

        var personalities = {
            leader: { title: "The Leader", icon: "fa-crown", desc: "You take charge, inspire others, and turn chaos into action. People naturally follow your lead." },
            creative: { title: "The Innovator", icon: "fa-lightbulb", desc: "You see possibilities others miss. Your ideas are bold, original, and always a little ahead of the curve." },
            social: { title: "The Connector", icon: "fa-heart", desc: "You're the glue that holds people together. Your warmth and energy make every group stronger." },
            analytical: { title: "The Thinker", icon: "fa-brain", desc: "You go deep, think clearly, and find the truth in the data. When things break, everyone turns to you." }
        };

        function showQuizQuestion() {
            if (currentQ >= questions.length) {
                showQuizResult();
                return;
            }
            var q = questions[currentQ];
            gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-wand-magic-sparkles me-2"></i>Which Classmate Are You?</h2><p style="color:var(--yb-muted);">Question ' + (currentQ + 1) + ' of ' + questions.length + '</p></div>' +
                '<div class="poll-question">' + escapeHtml(q.q) + '</div>' +
                '<div style="max-width:500px;margin:0 auto;" id="quiz-opts"></div>';

            var optsDiv = document.getElementById('quiz-opts');
            q.opts.forEach(function (opt, i) {
                var btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.addEventListener('click', function () {
                    traitScores[q.traits[i]]++;
                    currentQ++;
                    showQuizQuestion();
                });
                optsDiv.appendChild(btn);
            });
        }

        function showQuizResult() {
            var dominant = 'analytical';
            Object.keys(traitScores).forEach(function (t) {
                if (traitScores[t] > traitScores[dominant]) dominant = t;
            });
            var personality = personalities[dominant];

            // Match to a classmate using trait + name hash for variety
            var total = traitScores.leader * 7 + traitScores.creative * 13 + traitScores.social * 19 + traitScores.analytical * 23;
            var idx = total % classData.length;
            var p = classData[idx];

            gc.innerHTML = '<div class="quiz-result" style="text-align:center;">' +
                '<h2 style="font-family:Josefin Sans,sans-serif;font-weight:700;margin-bottom:0.5rem;">You are...</h2>' +
                '<p style="font-size:1.5rem;color:var(--yb-gold);font-weight:700;margin-bottom:1.5rem;"><i class="fa ' + personality.icon + ' me-2"></i>' + personality.title + '</p>' +
                '<p style="color:var(--yb-muted);max-width:500px;margin:0 auto 2rem;font-size:1.05rem;">' + personality.desc + '</p>' +
                '<div style="background:var(--yb-surface);border:1px solid var(--yb-border);border-radius:16px;padding:2rem;max-width:400px;margin:0 auto;">' +
                '<p style="color:var(--yb-muted);font-size:0.9rem;margin-bottom:1rem;">Your classmate match:</p>' +
                createImgOrPlaceholder(p, 'guess-photo') +
                '<h3 style="margin-top:1rem;">' + escapeHtml(p.name) + '</h3>' +
                '<p style="color:var(--yb-primary);font-size:1.1rem;font-style:italic;">' + escapeHtml(getFunLabel(p.name)) + '</p>' +
                (p.bio ? '<p style="color:var(--yb-muted);font-size:0.95rem;">' + escapeHtml(p.bio.substring(0, 150)) + (p.bio.length > 150 ? '...' : '') + '</p>' : '') +
                '</div>' +
                '<div style="margin-top:1.5rem;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;">' +
                '<div style="background:var(--yb-surface);border-radius:8px;padding:0.5rem 1rem;"><span style="color:var(--yb-muted);font-size:0.8rem;">Leader</span><div style="font-weight:700;">' + traitScores.leader + '</div></div>' +
                '<div style="background:var(--yb-surface);border-radius:8px;padding:0.5rem 1rem;"><span style="color:var(--yb-muted);font-size:0.8rem;">Innovator</span><div style="font-weight:700;">' + traitScores.creative + '</div></div>' +
                '<div style="background:var(--yb-surface);border-radius:8px;padding:0.5rem 1rem;"><span style="color:var(--yb-muted);font-size:0.8rem;">Connector</span><div style="font-weight:700;">' + traitScores.social + '</div></div>' +
                '<div style="background:var(--yb-surface);border-radius:8px;padding:0.5rem 1rem;"><span style="color:var(--yb-muted);font-size:0.8rem;">Thinker</span><div style="font-weight:700;">' + traitScores.analytical + '</div></div>' +
                '</div>' +
                '<button class="btn btn-primary mt-3" onclick="window.YB.loadGame(\'quiz\')">Try Again</button>' +
            '</div>';
            launchConfetti();
        }

        showQuizQuestion();
    }

    // ── 6. Classmate Bingo ──
    function initBingo(gc) {
        var prompts = [
            "Has pulled an all-nighter coding",
            "Loves anime or K-dramas",
            "Has debugged someone else's code",
            "Can explain recursion clearly",
            "Has slept through a lecture",
            "Plays video games regularly",
            "Has submitted an assignment last minute",
            "Knows how to cook well",
            "Has a side project or portfolio",
            "Can speak 3+ languages",
            "Has been to a hackathon",
            "Is always early to class",
            "FREE SPACE",
            "Has helped you with coursework",
            "Uses dark mode everywhere",
            "Has a LinkedIn profile",
            "Listens to music while coding",
            "Has forgotten their laptop charger",
            "Can do something artistic",
            "Has binge-watched an entire series",
            "Prefers tea over coffee",
            "Has broken production code",
            "Is into fitness or sports",
            "Wants to start a business",
            "Has made you laugh out loud"
        ];

        gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-dice me-2"></i>Classmate Bingo</h2>' +
            '<p style="color:var(--yb-muted);">Find classmates who match each square! Tap to mark off. Get 5 in a row to win!</p></div>' +
            '<div class="bingo-grid" id="bingo-grid"></div>' +
            '<div id="bingo-result" style="text-align:center;margin-top:1rem;"></div>';

        var grid = document.getElementById('bingo-grid');
        var marked = Array(25).fill(false);
        marked[12] = true;

        prompts.forEach(function (prompt, i) {
            var cell = document.createElement('div');
            cell.className = 'bingo-cell';
            if (i === 12) {
                cell.classList.add('marked');
                cell.innerHTML = '<i class="fa fa-star"></i>';
            } else {
                cell.textContent = prompt;
            }
            cell.addEventListener('click', function () {
                if (i === 12) return;
                marked[i] = !marked[i];
                cell.classList.toggle('marked', marked[i]);
                checkBingo();
            });
            grid.appendChild(cell);
        });

        function checkBingo() {
            var lines = [];
            for (var r = 0; r < 5; r++) {
                lines.push([r*5, r*5+1, r*5+2, r*5+3, r*5+4]);
                lines.push([r, r+5, r+10, r+15, r+20]);
            }
            lines.push([0, 6, 12, 18, 24]);
            lines.push([4, 8, 12, 16, 20]);

            for (var l = 0; l < lines.length; l++) {
                if (lines[l].every(function (idx) { return marked[idx]; })) {
                    document.getElementById('bingo-result').innerHTML = '<h3 style="color:var(--yb-gold);"><i class="fa fa-trophy me-2"></i>BINGO!</h3>';
                    launchConfetti();
                    return;
                }
            }
        }
    }

    // ── 7. Countdown Game ──
    function initCountdownGame(gc) {
        gc.innerHTML = '<div class="game-header"><h2><i class="fa fa-hourglass-half me-2"></i>Graduation Countdown</h2></div>' +
            '<div class="countdown-section" style="border-radius:20px;margin-top:1rem;">' +
            '<div class="countdown-grid">' +
            '<div class="countdown-item"><div class="countdown-number" id="gc-days">--</div><div class="countdown-label">Days</div></div>' +
            '<div class="countdown-item"><div class="countdown-number" id="gc-hours">--</div><div class="countdown-label">Hours</div></div>' +
            '<div class="countdown-item"><div class="countdown-number" id="gc-mins">--</div><div class="countdown-label">Minutes</div></div>' +
            '<div class="countdown-item"><div class="countdown-number" id="gc-secs">--</div><div class="countdown-label">Seconds</div></div>' +
            '</div></div>';

        function tick() {
            var diff = GRADUATION_DATE - new Date();
            if (diff <= 0) {
                gc.querySelector('.countdown-section').innerHTML = '<h2 style="color:#fff;"><i class="fa fa-graduation-cap me-2"></i>Graduation Day! <i class="fa fa-trophy"></i></h2>';
                launchConfetti();
                return;
            }
            document.getElementById('gc-days').textContent = Math.floor(diff / 86400000);
            document.getElementById('gc-hours').textContent = Math.floor((diff % 86400000) / 3600000);
            document.getElementById('gc-mins').textContent = Math.floor((diff % 3600000) / 60000);
            document.getElementById('gc-secs').textContent = Math.floor((diff % 60000) / 1000);
            requestAnimationFrame(tick);
        }
        tick();
    }

    // ── Scroll Fade-in ──
    function initScrollAnimations() {
        var targets = document.querySelectorAll('.fade-in-up');
        if (!targets.length) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        targets.forEach(function (t) { observer.observe(t); });
    }

    // ── Expose to global ──
    window.YB = {
        openModal: openModal,
        loadGame: loadGame
    };
    window.backToMenu = backToMenu;
    window.loadGame = loadGame;

    // ── Init ──
    function init() {
        initTheme();
        initMatrix();
        initCountdown();
        initScrollAnimations();
        initGuestbook();

        fetch('data/class.json?v=' + Date.now())
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) {
                classData = data;
                initPeopleGrid();
                initYearbook();
            })
            .catch(function (err) {
                console.warn('Could not load class data:', err);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
