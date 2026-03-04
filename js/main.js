// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载表单草稿
    loadFormDraft();
    // 渲染打卡记录
    renderRecords();

    // 表单提交事件
    document.getElementById('checkinForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitCheckin();
    });

    // 实时计算BMI/BMR
    const calcInputs = ['age', 'height', 'weight', 'gender'];
    calcInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', calculateBMIAndBMR);
    });

    // 导出记录按钮
    document.getElementById('exportBtn').addEventListener('click', exportRecords);
});

// 计算BMI和BMR
function calculateBMIAndBMR() {
    const age = parseInt(document.getElementById('age').value);
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const gender = document.getElementById('gender').value;

    if (age && height && weight) {
        // 计算BMI
        const bmi = (weight / Math.pow(height/100, 2)).toFixed(2);
        document.getElementById('bmi').value = bmi;

        // 计算BMR
        let bmr = 0;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else if (gender === 'female') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        document.getElementById('bmr').value = bmr ? `${bmr.toFixed(0)} 大卡/天` : '';

        // 保存表单草稿
        saveFormDraft();
    }
}

// 提交打卡
function submitCheckin() {
    // 获取表单数据
    const formData = {
        time: new Date().toLocaleString(),
        age: document.getElementById('age').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        gender: document.getElementById('gender').value,
        bmi: document.getElementById('bmi').value,
        bmr: document.getElementById('bmr').value.replace(' 大卡/天', ''),
        bust: document.getElementById('bust').value || '未填写',
        waist: document.getElementById('waist').value || '未填写',
        hip: document.getElementById('hip').value || '未填写',
        fatType: document.getElementById('fatType').value || '未填写',
        weightType: document.getElementById('weightType').value || '未填写',
        loseFatType: document.getElementById('loseFatType').value || '未填写',
        sportType: document.getElementById('sportType').value || '未填写',
        sportTime: document.getElementById('sportTime').value || '0',
        note: document.getElementById('note').value || '无'
    };

    // 验证必填项
    if (!formData.age || !formData.height || !formData.weight || !formData.gender) {
        alert('请填写必填项（年龄、身高、体重、性别）！');
        return;
    }

    // 计算运动消耗热量
    const calorie = calculateSportCalorie(formData.sportType, formData.sportTime, formData.weight);
    
    // 显示结果
    const resultCard = document.getElementById('resultCard');
    const resultContent = document.getElementById('resultContent');
    const calorieTip = document.getElementById('calorieTip');
    
    resultContent.innerHTML = `
        <p><strong>BMI指数：</strong>${formData.bmi} (${getBMICategory(formData.bmi)})</p>
        <p><strong>基础代谢率：</strong>${formData.bmr} 大卡/天</p>
        <p><strong>三围：</strong>胸围${formData.bust}cm | 腰围${formData.waist}cm | 臀围${formData.hip}cm</p>
        <p><strong>身体类型：</strong>脂肪类型${formData.fatType} | 体重类型${formData.weightType} | 减脂类型${formData.loseFatType}</p>
    `;
    
    calorieTip.innerHTML = `
        <strong>运动消耗：</strong>${calorie} 大卡（${formData.sportType || '无'} ${formData.sportTime}分钟）
    `;
    
    resultCard.style.display = 'block';

    // 保存记录
    saveRecord(formData);
    // 刷新记录列表
    renderRecords();
    // 清空表单草稿
    clearFormDraft();

    alert('打卡提交成功！');
}

// 计算运动消耗热量
function calculateSportCalorie(type, time, weight) {
    if (!type || !time || !weight) return 0;
    
    // 不同运动的热量消耗系数（大卡/分钟/公斤）
    const calorieRate = {
        running: 0.1,
        yoga: 0.03,
        strength: 0.08,
        rope: 0.12,
        walk: 0.05
    };

    return (calorieRate[type] * time * weight).toFixed(0);
}

// 判断BMI分类
function getBMICategory(bmi) {
    bmi = parseFloat(bmi);
    if (bmi < 18.5) return '偏瘦';
    else if (bmi < 24) return '正常';
    else if (bmi < 28) return '超重';
    else return '肥胖';
}

// 保存打卡记录
function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem('catCheckinRecords')) || [];
    records.unshift(record);
    localStorage.setItem('catCheckinRecords', JSON.stringify(records));
}

// 渲染打卡记录
function renderRecords() {
    const records = JSON.parse(localStorage.getItem('catCheckinRecords')) || [];
    const recordsList = document.getElementById('recordsList');

    if (records.length === 0) {
        recordsList.innerHTML = '<p class="empty-tip">暂无打卡记录，快来完成第一次打卡吧～</p>';
        return;
    }

    let html = '';
    records.forEach((item, index) => {
        html += `
            <div class="record-item">
                <div class="record-time">${item.time}</div>
                <div class="record-data">
                    <span>年龄：${item.age}岁</span>
                    <span>身高：${item.height}cm</span>
                    <span>体重：${item.weight}kg</span>
                    <span>BMI：${item.bmi}</span>
                </div>
                <div class="record-data">
                    <span>运动：${item.sportType || '无'}(${item.sportTime}分钟)</span>
                </div>
                <div><strong>备注：</strong>${item.note}</div>
            </div>
        `;
    });

    recordsList.innerHTML = html;
}

// 保存表单草稿
function saveFormDraft() {
    const draft = {
        age: document.getElementById('age').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        gender: document.getElementById('gender').value,
        bust: document.getElementById('bust').value,
        waist: document.getElementById('waist').value,
        hip: document.getElementById('hip').value,
        fatType: document.getElementById('fatType').value,
        weightType: document.getElementById('weightType').value,
        loseFatType: document.getElementById('loseFatType').value,
        sportType: document.getElementById('sportType').value,
        sportTime: document.getElementById('sportTime').value,
        note: document.getElementById('note').value
    };
    localStorage.setItem('catCheckinDraft', JSON.stringify(draft));
}

// 加载表单草稿
function loadFormDraft() {
    const draft = JSON.parse(localStorage.getItem('catCheckinDraft'));
    if (draft) {
        Object.keys(draft).forEach(key => {
            if (document.getElementById(key)) {
                document.getElementById(key).value = draft[key];
            }
        });
        // 重新计算BMI/BMR
        calculateBMIAndBMR();
    }
}

// 清空表单草稿
function clearFormDraft() {
    localStorage.removeItem('catCheckinDraft');
}

// 导出记录为CSV
function exportRecords() {
    const records = JSON.parse(localStorage.getItem('catCheckinRecords')) || [];
    if (records.length === 0) {
        alert('暂无记录可导出！');
        return;
    }

    // 构建CSV内容
    const headers = '时间,年龄,身高(cm),体重(kg),性别,BMI,BMR(大卡),胸围(cm),腰围(cm),臀围(cm),脂肪类型,体重类型,减脂类型,运动类型,运动时长(分钟),备注\n';
    let csvContent = headers;

    records.forEach(record => {
        const row = [
            record.time,
            record.age,
            record.height,
            record.weight,
            record.gender === 'male' ? '男' : '女',
            record.bmi,
            record.bmr,
            record.bust,
            record.waist,
            record.hip,
            translateType('fatType', record.fatType),
            translateType('weightType', record.weightType),
            translateType('loseFatType', record.loseFatType),
            translateType('sportType', record.sportType),
            record.sportTime,
            record.note
        ].join(',');
        csvContent += row + '\n';
    });

    // 下载CSV文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `猫猫运动打卡记录_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 翻译类型为中文
function translateType(type, value) {
    const map = {
        fatType: {
            visceral: '内脏脂肪型',
            subcutaneous: '皮下脂肪型',
            mixed: '混合型',
            '未填写': '未填写'
        },
        weightType: {
            underweight: '偏瘦',
            normal: '正常',
            overweight: '超重',
            obese: '肥胖',
            '未填写': '未填写'
        },
        loseFatType: {
            lowCarb: '低碳减脂',
            calorieControl: '热量控制',
            highProtein: '高蛋白减脂',
            exercise: '运动减脂',
            '未填写': '未填写'
        },
        sportType: {
            running: '跑步',
            yoga: '瑜伽',
            strength: '力量训练',
            rope: '跳绳',
            walk: '快走',
            '未填写': '无'
        }
    };
    return map[type][value] || value;
}