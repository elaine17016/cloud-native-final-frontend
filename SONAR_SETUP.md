# SonarCloud 設定（Monorepo：前後端分開）

儲存庫：https://github.com/elaine17016/cloud-native-final-team10  
Organization：`elaine17016`

## 兩個獨立的 SonarCloud 專案

| 元件 | Project Key | 設定檔 | CI Workflow |
|------|-------------|--------|-------------|
| 前端 | `elaine17016_cets_frontend` | `frontend/sonar-project.properties` | `.github/workflows/sonarcloud-frontend.yml` |
| 後端 | `elaine17016_cets_backend` | `backend/sonar-project.properties` | `.github/workflows/sonarcloud-backend.yml` |

儀表板連結（需先在 SonarCloud 建立對應專案）：

- 前端：https://sonarcloud.io/project/overview?id=elaine17016_cets_frontend
- 後端：https://sonarcloud.io/project/overview?id=elaine17016_cets_backend

## 一次性手動步驟

### 1) 在 SonarCloud 建立專案

1. 開啟 https://sonarcloud.io → 組織 `elaine17016`
2. **+ Analyze new project** → 選擇 `cloud-native-final-team10`（或手動建立）
3. 若手動建立，請使用上表 **Project Key**（前後端各一組）

### 2) GitHub Actions Secret

1. https://github.com/elaine17016/cloud-native-final-team10/settings/secrets/actions
2. **New repository secret**
3. Name：`SONAR_TOKEN`
4. Value：SonarCloud → My Account → Security → 產生的 Personal Access Token

> **安全提醒**：Token 僅能放在 GitHub Secret，勿提交至儲存庫或寫在聊天紀錄中。若已外洩，請在 SonarCloud 撤銷後重新產生。

### 3) 觸發掃描

- 變更 `frontend/**` 會執行 **SonarCloud Frontend**
- 變更 `backend/**` 會執行 **SonarCloud Backend**
- 也可在 Actions 頁面對任一 workflow 點選 **Run workflow**

## 本機驗證

### 前端

```powershell
cd frontend
npm ci
npm run test:coverage
$env:SONAR_HOST_URL="https://sonarcloud.io"
$env:SONAR_TOKEN="你的TOKEN"
sonar-scanner
```

### 後端

```powershell
cd backend
pip install -r requirements-dev.txt
$env:PYTHONPATH="."
pytest tests/unit --cov=app --cov-report=xml -q
$env:SONAR_HOST_URL="https://sonarcloud.io"
$env:SONAR_TOKEN="你的TOKEN"
sonar-scanner
```

## 常見問題

- **SONAR_TOKEN 空白**：GitHub Secret 未設定或名稱不是 `SONAR_TOKEN`
- **Project not found**：SonarCloud 尚未建立對應 `projectKey`
- **後端 coverage 0%**：請先執行 `pytest tests/unit --cov=app --cov-report=xml`
- **前端 coverage 0%**：請先執行 `npm run test:coverage`
