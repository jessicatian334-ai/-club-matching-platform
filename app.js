import { clubs, questionnaire } from './data.js';
import { calculateMatch } from './matching.js';

let currentPage = 'home';
let currentStep = 0;
let userProfile = {
  name: '',
  grade: '',
  major: '',
  interests: [],
  personality: [],
  availableTime: [],
  goals: []
};

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initNavigation();
  loadPage('home');
});

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const page = parts[0];
  const param = parts[1];

  if (page === 'club' && param) {
    loadClubDetail(parseInt(param));
  } else {
    loadPage(page);
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page, param = null) {
  if (param) {
    window.location.hash = `#${page}/${param}`;
  } else {
    window.location.hash = `#${page}`;
  }
}

function loadPage(page) {
  currentPage = page;
  updateNavigation();
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  switch (page) {
    case 'home':
      renderHome();
      break;
    case 'clubs':
      renderClubs();
      break;
    case 'questionnaire':
      renderQuestionnaire();
      break;
    case 'results':
      renderResults();
      break;
    case 'center':
      renderCenter();
      break;
  }
}

function updateNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === currentPage);
  });
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function renderHome() {
  const container = document.getElementById('popular-clubs');
  const sortedClubs = [...clubs].sort((a, b) => b.memberCount - a.memberCount).slice(0, 6);
  
  container.innerHTML = sortedClubs.map(club => `
    <div class="club-card" onclick="navigateTo('club', ${club.id})">
      <div class="club-icon">${club.image}</div>
      <h4>${club.name}</h4>
      <div class="club-tags">
        ${club.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <p class="club-desc">${club.description}</p>
      <div class="club-meta">
        <span>👥 ${club.memberCount}人</span>
        <span>📍 ${club.location.split(/[A-Z]/)[0]}</span>
      </div>
    </div>
  `).join('');
}

function renderClubs() {
  const container = document.getElementById('all-clubs');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const noResults = document.getElementById('no-results');
  
  let filteredClubs = [...clubs];
  const searchKeyword = searchInput.value.toLowerCase();
  const selectedCategory = document.querySelector('.category-btn.active')?.dataset.category || '';
  const sortBy = sortSelect.value;

  if (searchKeyword) {
    filteredClubs = filteredClubs.filter(club =>
      club.name.toLowerCase().includes(searchKeyword) ||
      club.description.toLowerCase().includes(searchKeyword) ||
      club.tags.some(tag => tag.toLowerCase().includes(searchKeyword))
    );
  }

  if (selectedCategory) {
    filteredClubs = filteredClubs.filter(club => club.category === selectedCategory);
  }

  if (sortBy === 'members') {
    filteredClubs.sort((a, b) => b.memberCount - a.memberCount);
  } else if (sortBy === 'recruit') {
    filteredClubs.sort((a, b) => b.recruitCount - a.recruitCount);
  }

  container.innerHTML = filteredClubs.map(club => `
    <div class="club-card" onclick="navigateTo('club', ${club.id})">
      <div class="club-icon">${club.image}</div>
      <h4>${club.name}</h4>
      <div class="club-tags">
        <span class="tag tag-success">${club.category}</span>
        ${club.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <p class="club-desc">${club.description}</p>
      <div class="club-meta">
        <span>👥 ${club.memberCount}</span>
        <span>📍 ${club.location.split(/[A-Z]/)[0]}</span>
      </div>
      <div class="club-card-actions">
        <button class="btn ${isFavorite(club.id) ? 'btn-warning' : 'btn-secondary'}" onclick="event.stopPropagation(); toggleFavorite(${club.id})">
          ${isFavorite(club.id) ? '已收藏' : '收藏'}
        </button>
        <button class="btn btn-primary" onclick="event.stopPropagation(); applyToClub(${club.id})">
          ${isApplied(club.id) ? '已报名' : '报名'}
        </button>
      </div>
    </div>
  `).join('');

  noResults.style.display = filteredClubs.length === 0 ? 'block' : 'none';

  searchInput.addEventListener('input', renderClubs);
  sortSelect.addEventListener('change', renderClubs);

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderClubs();
    });
  });
}

function loadClubDetail(clubId) {
  const club = clubs.find(c => c.id === clubId);
  if (!club) {
    navigateTo('clubs');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-club-detail').classList.add('active');

  const container = document.getElementById('club-detail-content');
  const isFav = isFavorite(club.id);
  const isApp = isApplied(club.id);

  container.innerHTML = `
    <div class="card">
      <div class="club-detail-header">
        <div class="club-detail-main">
          <div class="club-icon">${club.image}</div>
          <div class="club-detail-info">
            <h1>${club.name}</h1>
            <div class="club-detail-badges">
              <span class="tag tag-success">${club.category}</span>
              ${club.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="club-detail-actions">
          <button class="btn ${isFav ? 'btn-warning' : 'btn-secondary'}" onclick="toggleFavorite(${club.id}); loadClubDetail(${club.id});">
            ${isFav ? '已收藏' : '收藏'}
          </button>
          <button class="btn btn-primary" onclick="applyToClub(${club.id}); loadClubDetail(${club.id});" ${isApp ? 'disabled' : ''}>
            ${isApp ? '已报名' : '立即报名'}
          </button>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="main-content">
        <div class="section card">
          <h2>社团简介</h2>
          <p class="description">${club.description}</p>
        </div>

        <div class="section card">
          <h2>招新要求</h2>
          <ul class="requirements-list">
            ${club.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
        </div>

        <div class="section card">
          <h2>适合人群</h2>
          <div class="suitable-tags">
            ${club.personality.map(trait => `<span class="tag tag-warning">${trait}</span>`).join('')}
            ${club.suitableMajors.map(major => `<span class="tag">${major}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="side-content">
        <div class="info-card card">
          <h3>基本信息</h3>
          <div class="info-item">
            <span class="info-label">现有成员</span>
            <span class="info-value">${club.memberCount} 人</span>
          </div>
          <div class="info-item">
            <span class="info-label">本次招募</span>
            <span class="info-value">${club.recruitCount} 人</span>
          </div>
          <div class="info-item">
            <span class="info-label">活动时间</span>
            <span class="info-value">${club.meetingTime}</span>
          </div>
          <div class="info-item">
            <span class="info-label">活动地点</span>
            <span class="info-value">${club.location}</span>
          </div>
        </div>

        <div class="info-card card">
          <h3>联系方式</h3>
          <p class="contact-hint">报名后可查看联系方式</p>
          <button class="btn btn-primary" onclick="applyToClub(${club.id}); loadClubDetail(${club.id});" ${isApp ? 'disabled' : ''}>
            ${isApp ? '已报名' : '报名后获取'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderQuestionnaire() {
  currentStep = 0;
  userProfile = {
    name: '',
    grade: '',
    major: '',
    interests: [],
    personality: [],
    availableTime: [],
    goals: []
  };
  renderQuestionnaireStep();
}

function renderQuestionnaireStep() {
  updateStepIndicators();
  
  const container = document.getElementById('questionnaire-content');
  const titles = ['基本信息', '兴趣选择', '性格测试', '时间安排'];
  
  container.innerHTML = `
    <h2 class="question-title">${titles[currentStep]}</h2>
    <div class="step-content" id="step-content"></div>
    <div class="step-actions">
      ${currentStep > 0 ? '<button class="btn btn-secondary" onclick="prevStep()">上一步</button>' : ''}
      ${currentStep < 3 
        ? `<button class="btn btn-primary" onclick="nextStep()" id="next-btn" disabled>下一步</button>`
        : `<button class="btn btn-primary" onclick="submitQuestionnaire()" id="submit-btn" disabled>开始匹配</button>`
      }
    </div>
  `;

  switch (currentStep) {
    case 0:
      renderBasicInfo();
      break;
    case 1:
      renderInterests();
      break;
    case 2:
      renderPersonality();
      break;
    case 3:
      renderTimeAndGoals();
      break;
  }
}

function updateStepIndicators() {
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.remove('active', 'completed');
    if (index < currentStep) {
      step.classList.add('completed');
    } else if (index === currentStep) {
      step.classList.add('active');
    }
  });
}

function renderBasicInfo() {
  const container = document.getElementById('step-content');
  container.innerHTML = `
    <div class="form-group">
      <label>姓名</label>
      <input type="text" id="input-name" placeholder="请输入姓名" value="${userProfile.name}">
    </div>
    <div class="form-group">
      <label>年级</label>
      <select id="input-grade">
        <option value="">请选择年级</option>
        <option value="大一" ${userProfile.grade === '大一' ? 'selected' : ''}>大一</option>
        <option value="大二" ${userProfile.grade === '大二' ? 'selected' : ''}>大二</option>
        <option value="大三" ${userProfile.grade === '大三' ? 'selected' : ''}>大三</option>
        <option value="大四" ${userProfile.grade === '大四' ? 'selected' : ''}>大四</option>
      </select>
    </div>
    <div class="form-group">
      <label>专业</label>
      <select id="input-major">
        <option value="">请选择专业</option>
        ${questionnaire.majors.map(major => 
          `<option value="${major}" ${userProfile.major === major ? 'selected' : ''}>${major}</option>`
        ).join('')}
      </select>
    </div>
  `;

  const inputs = ['input-name', 'input-grade', 'input-major'];
  inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', validateBasicInfo);
    document.getElementById(id).addEventListener('change', validateBasicInfo);
  });

  validateBasicInfo();
}

function validateBasicInfo() {
  userProfile.name = document.getElementById('input-name').value;
  userProfile.grade = document.getElementById('input-grade').value;
  userProfile.major = document.getElementById('input-major').value;
  
  const canNext = userProfile.name && userProfile.grade && userProfile.major;
  document.getElementById('next-btn').disabled = !canNext;
}

function renderInterests() {
  const container = document.getElementById('step-content');
  container.innerHTML = `
    <p class="step-desc">请选择你感兴趣的领域（可多选）</p>
    <div class="interest-grid">
      ${questionnaire.interests.map(item => `
        <div class="interest-item ${userProfile.interests.includes(item.id) ? 'selected' : ''}" 
             onclick="toggleInterest('${item.id}')">
          <span class="interest-icon">${item.icon}</span>
          <span class="interest-label">${item.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleInterest(id) {
  const index = userProfile.interests.indexOf(id);
  if (index > -1) {
    userProfile.interests.splice(index, 1);
  } else {
    userProfile.interests.push(id);
  }
  renderInterests();
  validateInterests();
}

function validateInterests() {
  document.getElementById('next-btn').disabled = userProfile.interests.length === 0;
}

function renderPersonality() {
  const container = document.getElementById('step-content');
  container.innerHTML = `
    <p class="step-desc">请选择最符合你性格的描述（可多选）</p>
    <div class="personality-list">
      ${questionnaire.personality.map(item => `
        <div class="personality-item ${userProfile.personality.includes(item.id) ? 'selected' : ''}" 
             onclick="togglePersonality('${item.id}')">
          <div class="personality-title">${item.label}</div>
          <div class="personality-desc">${item.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function togglePersonality(id) {
  const index = userProfile.personality.indexOf(id);
  if (index > -1) {
    userProfile.personality.splice(index, 1);
  } else {
    userProfile.personality.push(id);
  }
  renderPersonality();
  validatePersonality();
}

function validatePersonality() {
  document.getElementById('next-btn').disabled = userProfile.personality.length === 0;
}

function renderTimeAndGoals() {
  const container = document.getElementById('step-content');
  container.innerHTML = `
    <p class="step-desc">请选择你空闲的时间段（可多选）</p>
    <div class="checkbox-grid">
      ${questionnaire.availableTime.map(item => `
        <label class="checkbox-item ${userProfile.availableTime.includes(item.id) ? 'selected' : ''}" 
               onclick="toggleTime('${item.id}')">
          <input type="checkbox" value="${item.id}">
          <span class="checkbox-custom"></span>
          <span>${item.label}</span>
        </label>
      `).join('')}
    </div>
    
    <p class="step-desc" style="margin-top: 32px;">你加入社团的主要目标是什么？（可多选）</p>
    <div class="goal-list">
      ${questionnaire.goals.map(item => `
        <div class="goal-item ${userProfile.goals.includes(item.id) ? 'selected' : ''}" 
             onclick="toggleGoal('${item.id}')">
          <input type="checkbox" value="${item.id}">
          <div>
            <div class="goal-label">${item.label}</div>
            <div class="goal-desc">${item.description}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function toggleTime(id) {
  const index = userProfile.availableTime.indexOf(id);
  if (index > -1) {
    userProfile.availableTime.splice(index, 1);
  } else {
    userProfile.availableTime.push(id);
  }
  renderTimeAndGoals();
  validateTimeAndGoals();
}

function toggleGoal(id) {
  const index = userProfile.goals.indexOf(id);
  if (index > -1) {
    userProfile.goals.splice(index, 1);
  } else {
    userProfile.goals.push(id);
  }
  renderTimeAndGoals();
  validateTimeAndGoals();
}

function validateTimeAndGoals() {
  const canSubmit = userProfile.availableTime.length > 0 && userProfile.goals.length > 0;
  document.getElementById('submit-btn').disabled = !canSubmit;
}

function nextStep() {
  if (currentStep < 3) {
    currentStep++;
    renderQuestionnaireStep();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    renderQuestionnaireStep();
  }
}

function submitQuestionnaire() {
  const results = calculateMatch(userProfile);
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
  localStorage.setItem('matchResults', JSON.stringify(results));
  navigateTo('results');
}

function renderResults() {
  const savedResults = localStorage.getItem('matchResults');
  if (!savedResults) {
    navigateTo('questionnaire');
    return;
  }

  const results = JSON.parse(savedResults);
  const container = document.getElementById('match-results');

  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>未找到匹配的社团</p></div>';
    return;
  }

  const topClub = results[0];
  const otherClubs = results.slice(1);

  let html = `
    <div class="top-match">
      <div class="match-badge">最佳匹配</div>
      <div class="top-club-card card" onclick="navigateTo('club', ${topClub.club.id})">
        <div class="club-header">
          <div class="club-image">${topClub.club.image}</div>
          <div class="club-title">
            <h2>${topClub.club.name}</h2>
            <div class="match-score">
              <div class="progress-bar-small">
                <div class="progress-fill ${topClub.score >= 80 ? 'high' : topClub.score >= 60 ? 'medium' : 'low'}" 
                     style="width: ${topClub.score}%"></div>
              </div>
              <span class="score-text">匹配度 ${topClub.score}%</span>
            </div>
          </div>
          <div class="club-actions">
            <button class="btn btn-primary" onclick="event.stopPropagation(); applyToClub(${topClub.club.id})">立即报名</button>
            <button class="btn ${isFavorite(topClub.club.id) ? 'btn-warning' : 'btn-secondary'}" 
                    onclick="event.stopPropagation(); toggleFavorite(${topClub.club.id}); renderResults();">
              ${isFavorite(topClub.club.id) ? '已收藏' : '收藏'}
            </button>
          </div>
        </div>
        <div class="match-reasons">
          ${topClub.reasons.map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  if (otherClubs.length > 0) {
    html += `
      <h2 class="section-subtitle">其他推荐</h2>
      <div class="club-grid">
        ${otherClubs.map(item => `
          <div class="club-card" onclick="navigateTo('club', ${item.club.id})">
            <div class="club-icon">${item.club.image}</div>
            <h4>${item.club.name}</h4>
            <div class="club-tags">
              <span class="tag tag-success">${item.club.category}</span>
              <span class="tag">匹配度 ${item.score}%</span>
            </div>
            <p class="club-desc">${item.club.description}</p>
            <div class="club-meta">
              <span>👥 ${item.club.memberCount}人</span>
              <span>📍 ${item.club.location.split(/[A-Z]/)[0]}</span>
            </div>
            <div class="club-card-actions">
              <button class="btn btn-primary" onclick="event.stopPropagation(); applyToClub(${item.club.id})">
                ${isApplied(item.club.id) ? '已报名' : '报名'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = html;
}

function renderCenter() {
  const savedProfile = localStorage.getItem('userProfile');
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    document.getElementById('user-name').textContent = profile.name || '未登录用户';
    document.getElementById('user-detail').textContent = `${profile.grade || ''} ${profile.major || ''}`;
    document.getElementById('user-avatar').textContent = profile.name ? profile.name.charAt(0) : '?';
  }

  renderTabContent('applications');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTabContent(btn.dataset.tab);
    });
  });
}

function renderTabContent(tab) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');

  switch (tab) {
    case 'applications':
      renderApplications();
      break;
    case 'favorites':
      renderFavorites();
      break;
    case 'history':
      renderHistory();
      break;
  }
}

function renderApplications() {
  const container = document.getElementById('applications-list');
  const applications = JSON.parse(localStorage.getItem('applications') || '[]');

  if (applications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无报名记录</p>
        <button class="btn btn-primary" onclick="navigateTo('clubs')">去报名</button>
      </div>
    `;
    return;
  }

  container.innerHTML = applications.map(app => `
    <div class="club-item card" onclick="navigateTo('club', ${app.id})">
      <div class="club-icon">${app.image}</div>
      <div class="club-info">
        <h3>${app.name}</h3>
        <p style="color: #999; font-size: 12px;">报名时间: ${formatDate(app.applyTime)}</p>
      </div>
      <span class="tag tag-warning">审核中</span>
    </div>
  `).join('');
}

function renderFavorites() {
  const container = document.getElementById('favorites-list');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无收藏</p>
        <button class="btn btn-primary" onclick="navigateTo('clubs')">去逛逛</button>
      </div>
    `;
    return;
  }

  container.innerHTML = favorites.map(fav => `
    <div class="club-item card" onclick="navigateTo('club', ${fav.id})">
      <div class="club-icon">${fav.image}</div>
      <div class="club-info">
        <h3>${fav.name}</h3>
        <p class="club-desc">${fav.description}</p>
      </div>
      <div class="item-actions">
        <button class="btn btn-primary" onclick="event.stopPropagation(); applyToClub(${fav.id}); renderFavorites();">
          ${isApplied(fav.id) ? '已报名' : '报名'}
        </button>
        <button class="btn btn-secondary" onclick="event.stopPropagation(); removeFavorite(${fav.id}); renderFavorites();">
          取消收藏
        </button>
      </div>
    </div>
  `).join('');
}

function renderHistory() {
  const container = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('matchResults') || '[]');

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>暂无匹配记录</p>
        <button class="btn btn-primary" onclick="navigateTo('questionnaire')">开始匹配</button>
      </div>
    `;
    return;
  }

  container.innerHTML = history.slice(0, 5).map((item, index) => `
    <div class="history-item">
      <div class="rank">${index + 1}</div>
      <div class="club-icon">${item.club.image}</div>
      <div class="club-info">
        <h3>${item.club.name}</h3>
        <div class="club-tags">
          ${item.reasons.slice(0, 2).map(reason => `<span class="reason-tag">${reason}</span>`).join('')}
        </div>
      </div>
      <div class="score">
        <div class="progress-bar-small">
          <div class="progress-fill ${item.score >= 80 ? 'high' : item.score >= 60 ? 'medium' : 'low'}" 
               style="width: ${item.score}%"></div>
        </div>
        <span style="font-weight: 600; color: var(--primary-color);">${item.score}%</span>
      </div>
    </div>
  `).join('');
}

function isFavorite(clubId) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favorites.some(f => f.id === clubId);
}

function isApplied(clubId) {
  const applications = JSON.parse(localStorage.getItem('applications') || '[]');
  return applications.some(a => a.id === clubId);
}

function toggleFavorite(clubId) {
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.findIndex(f => f.id === clubId);
  
  if (index > -1) {
    favorites.splice(index, 1);
    showToast('已取消收藏', 'info');
  } else {
    favorites.push(club);
    showToast('已添加收藏', 'success');
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function removeFavorite(clubId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.findIndex(f => f.id === clubId);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showToast('已取消收藏', 'info');
  }
}

function applyToClub(clubId) {
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;

  let applications = JSON.parse(localStorage.getItem('applications') || '[]');
  
  if (applications.some(a => a.id === clubId)) {
    showToast('你已经报过名了', 'info');
    return;
  }

  applications.push({ ...club, applyTime: new Date().toISOString() });
  localStorage.setItem('applications', JSON.stringify(applications));
  showToast(`已提交 ${club.name} 的报名申请！`, 'success');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

window.navigateTo = navigateTo;
window.toggleFavorite = toggleFavorite;
window.removeFavorite = removeFavorite;
window.applyToClub = applyToClub;
window.loadClubDetail = loadClubDetail;
window.renderResults = renderResults;
window.toggleInterest = toggleInterest;
window.togglePersonality = togglePersonality;
window.toggleTime = toggleTime;
window.toggleGoal = toggleGoal;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.submitQuestionnaire = submitQuestionnaire;
