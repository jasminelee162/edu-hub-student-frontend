import request, { post, get } from "@/utils/request";
import axios from "@/utils/request";
// export function products(params) {
//     return request({
//       url: "/api/v1/products",  //接口路径
//       method: "get",  //接口方法
//       headers: { 'Content-Type': 'multipart/form-data' }, //给接口添加请求头
//       params  //接口参数
//     });
// }
// ✅ 提交任务 ID，后端返回学习进度
export function updateLearningProgress(data) {
    return request({
        url: '/student/updateLearningProgress',
        method: 'post',
        data
    })
}
// 获取学生薄弱科目列表
export function getStudentWeakList() {
    return request({
        url: '/student/getStudentStrengthsAndWeaknesses',
        method: 'get'
    })
}

// 获取 AI 智能学习建议

export function getAISuggestion(id) {
    return request({
        url: '/ai/suggestion',
        method: 'get',
        params: { id }  // 正确拼接为 ?id=123
    })
}
// 发送聊天信息给 AI
export function getAIChat(params) {
    return request({
        url: '/ai/chat',
        method: 'get',
        params
    })
}
// 获取错题数据
export function getWrongAnswers() {
    return request({
        url: '/student/getWrongAnswers',
        method: 'get'
    })
}
// 获取所有题目（返回 id、标题、难度系数等）
export function getAllQuestions() {
    return request({
        url: '/sandbox/questions',
        method: 'get'
    })
}

// 获取题目标题
export function getTitle(questionId) {
    return request({
        url: '/sandbox/title',
        method: 'get',
        params: { questionId }
    })
}

// 获取题目详细描述
export function getDescription(questionId) {
    return request({
        url: '/sandbox/description',
        method: 'get',
        params: { questionId }
    })
}

// 执行 SQL 查询接口
export function executeQuery(data) {
    return request({
        url: '/sandbox/execute',
        method: 'post',
        data // 包含 questionId、request、userStamp
    })
}
// 确认共享文档是否存在
export function confirmDocument(documentId) {
    return axios.get('/confirm', {
        params: {
            documentId: documentId
        }
    })
}
//实验
export function getAllExperiments() {
    return request({
        url: '/experiments/getAllExperiment',
        method: 'get'
    })
}
export function createDocument(templateId, userId) {
    return request({
        url: '/create',
        method: 'post',
        data: {
            templateId,
            userId
        }
    })
}

export const initDocument = (id, userId) =>
    request.post(`/${id}/init`, { userId })

export const getAllVersions = (documentId) =>
    request.get(`/documentVersion/all?documentId=${documentId}`)

export const rollbackVersion = (versionId,userId) =>
    request.get(`/documentVersion/rollback?versionId=${versionId}&&userId=${userId}`)

export function recordVersion(documentId, content, changeNote) {
    return request({
        url: '/documentVersion/record',
        method: 'post',
        params: { documentId, content, changeNote }
    })
}

export const getTemplateList = () =>
    request.get('/template/show')

export const getTemplateContent = (id) => {
    return request.get('/template/content', {
        params: { id }
    })
}
// 发送邮箱验证码
export function sendEmailCode(email) {
    return axios.post('/email/sendCode', { email })
}

// 邮箱验证码登录
export function loginWithEmail(email, code) {
    return axios.post('/email/login', { email, code })
}
//-------------------------------登录---------------------------------------
// 登录
export const login = (params) => post("/login",params)
//登出
export const logout = () => get("/login/logout")
//用户注册
export const register = (params) => post("/login/register",params)
//获取登录用户信息
export const getUser = () => get("/user/getUserInfo")
//获取学校列表
export const getSchoolList = () => get("/school/getSchoolList")
//获取专业列表
export const getMajorList = () => get("/major/getMajorList")
//主页数据
export const getIndexAchievement = () => get("/index/getIndexAchievement")
//主页获取笔记
export const getIndexArticleList = () => get("/article/getIndexArticleList")
//分页获取课程
export const getTaskPage = (params) => post("/task/getTaskPage",params)
//获取分类列表 
export const getClassificationList = () => get("/classification/getClassificationList")
//获取教师分页
export const getUserPage = (params) => post("/user/getUserPage",params)
//分页获取笔记
export const getArticlePage = (params) => post("/article/getArticlePage",params)
//分页获取公告
export const getAccountPage = (params) => post("/account/getAccountPage",params)
//分页获取留言
export const getMessagePage = (params) => post("/message/getMessagePage",params)
//保存留言
export const saveMessage = (params) => post("/message/saveMessage",params)
//获取个人信息
export const getUserInfo = () => get("/user/getUserInfo")
//保存个人信息
export const setUserInfo = (params) => post("/user/setUserInfo",params)
//保存头像
export const setUserAvatar = (params) => post("/user/setUserAvatar",params)
//修改密码
export const changePassword = (params) => post("/user/changePassword",params)
//获取课程信息
export const getTaskById = (params) => get("/task/getTaskById",params)
//保存课程报名
export const saveTaskStudent = (params) => post("/student/saveTaskStudent",params)
//获取用户报名情况
export const getTaskStudent = (params) => get("/student/getTaskStudent",params)
//根据课程id获取章节
export const getChapterByTaskId = (params) => get("/chapter/getChapterByTaskId",params)
//保存课程评论
export const saveTaskComment = (params) => post("/comment/saveTaskComment",params)
//获取课程评论
export const getTaskCommentListByTaskId = (params) => get("/comment/getTaskCommentListByTaskId",params)
//获取教师课程列表
export const getTaskByTeacher = (params) => get("/task/getTaskByTeacher",params)
//获取教师详情
export const getUserById = (params) => get("/user/getUserById",params)
//获取笔记详情
export const getArticleById = (params) => get("/article/getArticleById",params)
// 编辑笔记接口
export const editArticle = (data) => post("/article/editArticle", data)
//保存笔记评论
export const saveArticleComment = (params) => post("/articleComment/saveArticleComment",params)
//获取笔记评论
export const getArticleCommentByArticleId = (params) => get("/articleComment/getArticleCommentByArticleId",params)
//查询笔记收藏
export const getArticleFavorPage = (params) => post("/favor/getArticleFavorPage",params)
//根据id查询笔记收藏
export const getArticleFavorById = (params) => get("/favor/getArticleFavorById",params)
//保存笔记收藏
export const saveArticleFavor = (params) => post("/favor/saveArticleFavor",params)
//更新笔记收藏
export const editArticleFavor = (params) => post("/favor/editArticleFavor",params)
//删除ArticleFavor
export const removeArticleFavor = (params) => post("/favor/removeArticleFavor",params)
//我的课程
export const getMyTaskPage = (params) => post("/student/getMyTaskPage",params)
//我的课程列表 
export const getMyTaskList = (params) => post("/student/getMyTaskList",params)
//保存笔记
export const saveArticle = (params) => post("/article/saveArticle",params)
//根据id获取章节
export const getChapterById = (params) => get("/chapter/getChapterById",params)
//查询学生作业
export const getHomeworkStudentPage = (params) => post("/student/getHomeworkStudentPage",params)
//根据id查询学生作业
export const getHomeworkStudentById = (params) => get("/student/getHomeworkStudentById",params)
//保存学生作业
export const saveHomeworkStudent = (params) => post("/student/saveHomeworkStudent",params)
//更新学生作业
export const editHomeworkStudent = (params) => post("/student/editHomeworkStudent",params)
//删除HomeworkStudent
export const removeHomeworkStudent = (params) => get("/student/removeHomeworkStudent",params)
//获取作业题目
export const getHomeworkStudentList = (params) => post("/student/getHomeworkStudentList",params)
//获取章节作业数
export const getHomeworkByChapterId = (params) => get("/homework/getHomeworkByChapterId",params)
//获取作业完成标志
export const getHomeworkStudentFlag = (params) => get("/student/getHomeworkStudentFlag",params)
//获取我的作业
export const getMyHomework = (params) => get("/student/getMyHomework",params)
//获取错题
export const getWrongWork = (params) => get("/student/getWrongWork",params)
//保存章节视频是否观看
export const saveChapterVideo = (params) => post("/chapterVideo/saveChapterVideo",params)
//后去考试列表
export const getTestListByUser = (params) => get("/test/getTestListByUser",params)
//查询用户考试题目
export const getTestStudentPage = (params) => post("/student/getTestStudentPage",params)
//根据id查询用户考试题目
export const getTestStudentById = (params) => get("/student/getTestStudentById",params)
//更新用户考试题目
export const editTestStudent = (params) => post("/student/editTestStudent",params)
//删除TestStudent
export const removeTestStudent = (params) => get("/student/removeTestStudent",params)
//获取考试题目
export const getTestItemByTestId = (params) => get("/item/getTestItemByTestId",params)
//保存考试内容
export const saveTestStudent = (params) => post("/student/saveTestStudent",params)
//获取考试状态
export const getTestUserState = (params) => get("/student/getTestUserState",params)
export const getTaskChapterStudy = (params) => get("/chapter/getTaskChapterStudy",params)

//-------------------------------论坛---------------------------------------
//查询论坛
export const getForumPage = (params) => post("/forum/getForumPage",params)
//根据id查询论坛
export const getForumById = (params) => get("/forum/getForumById",params)
//保存论坛
export const saveForum = (params) => post("/forum/saveForum",params)
//更新论坛
export const editForum = (params) => post("/forum/editForum",params)
//删除Forum
export const removeForum = (params) => get("/forum/removeForum",params)

//-------------------------------论坛讨论---------------------------------------
//查询论坛讨论
export const getForumItemPage = (params) => post("/item/getForumItemPage",params)
export const getForumItemList = (params) => post("/item/getForumItemList",params)
//根据id查询论坛讨论
export const getForumItemById = (params) => get("/item/getForumItemById",params)
//保存论坛讨论
export const saveForumItem = (params) => post("/item/saveForumItem",params)
//更新论坛讨论
export const editForumItem = (params) => post("/item/editForumItem",params)
//删除ForumItem
export const removeForumItem = (params) => get("/item/removeForumItem",params)

//-------------------------------答疑---------------------------------------
//查询答疑
export const getQuestionPage = (params) => post("/question/getQuestionPage",params)
//根据id查询答疑
export const getQuestionById = (params) => get("/question/getQuestionById",params)
//保存答疑
export const saveQuestion = (params) => post("/question/saveQuestion",params)
//更新答疑
export const editQuestion = (params) => post("/question/editQuestion",params)
//删除Question
export const removeQuestion = (params) => get("/question/removeQuestion",params)

export const getTaskFavorById = (params) => get("/favor/getTaskFavorById",params)

export const removeTaskFavor = (params) => get("/favor/removeTaskFavor",params)

export const saveTaskFavor = (params) => post("/favor/saveTaskFavor",params)

export const getTaskFavorPage = (params) => post("/favor/getTaskFavorPage",params)

export function canEnterTest(params) {
  return request.get('/student/canEnterTest', { params })
}