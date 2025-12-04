<template>
	<view class="settings-container">
		<!-- 设置内容区域 -->
		<scroll-view class="settings-content" scroll-y="true">
			<!-- 搜索设置 -->
			<view class="setting-group">
				<view class="group-title">搜索设置</view>

				<!-- 搜索平台选择 -->
				<view class="setting-item">
					<view class="item-label">搜索平台</view>
					<view class="platform-options">
						<view class="platform-option" @click="togglePlatform('netease')">
							<view class="option-name">网易云音乐</view>
							<view class="switch" :class="{ 'on': searchPlatforms.netease }">
								<view class="switch-dot" :class="{ 'on': searchPlatforms.netease }"></view>
							</view>
						</view>
						<view class="platform-option" @click="togglePlatform('qq')">
							<view class="option-name">QQ音乐</view>
							<view class="switch" :class="{ 'on': searchPlatforms.qq }">
								<view class="switch-dot" :class="{ 'on': searchPlatforms.qq }"></view>
							</view>
						</view>
					</view>
				</view>

				<!-- 搜索优先级排序 -->
				<view class="setting-item">
					<view class="item-label">搜索顺序</view>
					<view class="priority-sort">
						<view v-for="(platform, index) in platformOrder" :key="platform" class="sort-item"
							@click="changePriority(index)">
							<view class="sort-index">{{ index + 1 }}</view>
							<view class="sort-name">{{ platformNames[platform] }}</view>
						</view>
					</view>
				</view>

				<!-- 搜索数量设置 -->
				<view class="setting-item" v-if="searchPlatforms.netease">
					<view class="item-label">网易云音乐搜索数量</view>
					<view class="search-count">
						<view class="count-btn" @click="decreaseCount('netease')">-</view>
						<view class="count-value">{{ searchCounts.netease }}</view>
						<view class="count-btn" @click="increaseCount('netease')">+</view>
					</view>
				</view>

				<view class="setting-item" v-if="searchPlatforms.qq">
					<view class="item-label">QQ音乐搜索数量</view>
					<view class="search-count">
						<view class="count-btn" @click="decreaseCount('qq')">-</view>
						<view class="count-value">{{ searchCounts.qq }}</view>
						<view class="count-btn" @click="increaseCount('qq')">+</view>
					</view>
				</view>
			</view>

			<!-- 歌词设置 -->
			<view class="setting-group">
				<view class="group-title">歌词设置</view>

				<!-- 歌词格式选择 -->
				<view class="setting-item">
					<view class="item-label">歌词下载格式</view>
					<view class="format-options">
						<view class="format-option" :class="{ 'active': lyricFormat === 'lrc' }"
							@click="setLyricFormat('lrc')">
							LRC
						</view>
						<view class="format-option" :class="{ 'active': lyricFormat === 'srt' }"
							@click="setLyricFormat('srt')">
							SRT
						</view>
					</view>
				</view>

				<!-- 歌词翻译选项 -->
				<view class="setting-item">
					<view class="item-label">获取歌词翻译</view>
					<view class="toggle-option" @click="toggleTranslation">
						<view class="switch" :class="{ 'on': getTranslation }">
							<view class="switch-dot" :class="{ 'on': getTranslation }"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 其他设置建议 -->
			<view class="setting-group">
				<!-- <view class="group-title">其他设置</view> -->

				<!-- 歌词保存位置 -->
				<!-- <view class="setting-item">
					<view class="item-label">歌词保存位置（暂无法设置）</view>
					<view class="location-value">
						{{ saveLocation }}
						<text class="iconfont icon-arrow-right"></text>
					</view>
				</view> -->

				<!-- 自动检查更新 -->
				<!-- <view class="setting-item">
					<view class="item-label">自动检查更新</view>
					<view class="toggle-option" @click="toggleAutoUpdate">
						<view class="switch" :class="{ 'on': autoUpdate }">
							<view class="switch-dot" :class="{ 'on': autoUpdate }"></view>
						</view>
					</view>
				</view> -->
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue"
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'

	// ============ 页面数据定义 ============
	
	/**
	 * 搜索平台启用状态
	 * netease: 网易云音乐是否启用
	 * qq: QQ音乐是否启用
	 */
	const searchPlatforms = ref({
		netease: true,
		qq: true
	})

	/**
	 * 平台搜索优先级顺序
	 * 数组中靠前的平台优先级更高，搜索结果会优先显示
	 */
	const platformOrder = ref(['netease', 'qq'])
	
	/**
	 * 平台标识与中文名称的映射关系
	 */
	const platformNames = {
		netease: '网易云音乐',
		qq: 'QQ音乐'
	}

	/**
	 * 各平台搜索数量限制
	 * 控制每个平台返回的搜索结果数量（1-50）
	 */
	const searchCounts = ref({
		netease: 5,
		qq: 5
	})

	/** 歌词下载格式：lrc 或 srt */
	const lyricFormat = ref('lrc')
	
	/** 是否获取歌词翻译 */
	const getTranslation = ref(true)
	
	/** 歌词保存位置（当前版本暂不可修改） */
	const saveLocation = ref('内部存储/歌词助手/')
	
	/** 是否自动检查更新 */
	const autoUpdate = ref(true)
	
	/** 是否启用深色模式 */
	const darkMode = ref(false)

	// ============ 事件处理函数 ============
	
	/**
	 * 返回上一页
	 */
	const navigateBack = () => {
		uni.navigateBack()
	}

	/**
	 * 切换搜索平台的启用状态
	 * @param {string} platform - 平台标识（netease 或 qq）
	 */
	const togglePlatform = (platform) => {
		searchPlatforms.value[platform] = !searchPlatforms.value[platform]
		// 立即保存设置
		saveSettings()
	}

	/**
	 * 更改平台搜索优先级
	 * 点击某个平台时，将其与相邻平台交换位置
	 * @param {number} index - 当前点击的平台在数组中的索引
	 */
	const changePriority = (index) => {
		// 如果不是最后一个元素，与下一个交换位置
		if (index < platformOrder.value.length - 1) {
			[platformOrder.value[index], platformOrder.value[index + 1]] = [
				platformOrder.value[index + 1],
				platformOrder.value[index]
			]
		} 
		// 如果是最后一个元素，与前一个交换位置
		else if (index > 0) {
			[platformOrder.value[index], platformOrder.value[index - 1]] = [
				platformOrder.value[index - 1],
				platformOrder.value[index]
			]
		}
		// 立即保存设置
		saveSettings()
	}

	/**
	 * 增加某个平台的搜索数量
	 * @param {string} platform - 平台标识（netease 或 qq）
	 * 搜索数量上限为 50
	 */
	const increaseCount = (platform) => {
		if (searchCounts.value[platform] < 50) {
			searchCounts.value[platform] += 1
			saveSettings()
		}
	}

	/**
	 * 减少某个平台的搜索数量
	 * @param {string} platform - 平台标识（netease 或 qq）
	 * 搜索数量下限为 1
	 */
	const decreaseCount = (platform) => {
		if (searchCounts.value[platform] > 1) {
			searchCounts.value[platform] -= 1
			saveSettings()
		}
	}

	/**
	 * 设置歌词下载格式
	 * @param {string} format - 歌词格式（lrc 或 srt）
	 */
	const setLyricFormat = (format) => {
		lyricFormat.value = format
		saveSettings()
	}

	/**
	 * 切换是否获取歌词翻译
	 */
	const toggleTranslation = () => {
		getTranslation.value = !getTranslation.value
		saveSettings()
	}

	/**
	 * 切换自动检查更新选项
	 */
	const toggleAutoUpdate = () => {
		autoUpdate.value = !autoUpdate.value
	}

	/**
	 * 切换深色模式
	 */
	const toggleDarkMode = () => {
		darkMode.value = !darkMode.value
	}

	/**
	 * 保存所有设置到本地存储
	 * 使用 uni.setStorage 异步保存到本地
	 * 存储的数据包括：
	 * - searchPlatforms: 平台启用状态
	 * - platformOrder: 平台搜索优先级顺序
	 * - searchCounts: 各平台搜索数量限制
	 * - lyricFormat: 歌词下载格式
	 * - getTranslation: 是否获取翻译
	 * - autoUpdate: 是否自动更新
	 * - darkMode: 是否深色模式
	 */
	const saveSettings = () => {
		uni.setStorage({
			key: 'appSettings',
			data: {
				searchPlatforms: searchPlatforms.value,
				platformOrder: platformOrder.value,
				searchCounts: searchCounts.value,
				lyricFormat: lyricFormat.value,
				getTranslation: getTranslation.value,
				autoUpdate: autoUpdate.value,
				darkMode: darkMode.value
			},
		})
	}

	// ============ 生命周期钩子 ============
	
	/**
	 * 页面加载时从本地存储读取保存的设置
	 * 如果本地没有保存的设置，则使用默认值
	 */
	onLoad(() => {
		uni.getStorage({
			key: 'appSettings',
			success: (res) => {
				const settings = res.data
				if (settings) {
					// 恢复各项设置，如果某项不存在则使用当前默认值
					searchPlatforms.value = settings.searchPlatforms || searchPlatforms.value
					platformOrder.value = settings.platformOrder || platformOrder.value
					searchCounts.value = settings.searchCounts || searchCounts.value
					lyricFormat.value = settings.lyricFormat || lyricFormat.value
					getTranslation.value = settings.getTranslation || getTranslation.value
					autoUpdate.value = settings.autoUpdate || autoUpdate.value
					darkMode.value = settings.darkMode || darkMode.value
				}
			}
		})
	})
</script>

<style scoped>
	.settings-container {
		background-color: #f8f8f8;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* 设置内容区域 */
	.settings-content {
		flex: 1;
		/* 为底部按钮留出空间 */
	}

	.setting-group {
		background-color: #fff;
		margin-bottom: 15px;
	}

	.group-title {
		font-size: 14px;
		color: #888;
		padding: 15px 15px 5px;
	}

	.setting-item {
		padding: 15px;
		border-bottom: 1px solid #eee;
	}

	.setting-item:last-child {
		border-bottom: none;
	}

	.item-label {
		font-size: 15px;
		color: #333;
		margin-bottom: 10px;
	}

	/* 搜索平台选项 */
	.platform-options {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}

	.platform-option {
		display: flex;
		align-items: center;
		width: 48%;
		padding: 10px;
		border: 1px solid #eee;
		border-radius: 8px;
	}

	.option-name {
		flex: 1;
		font-size: 14px;
	}

	/* 开关样式 */
	.switch {
		width: 40px;
		height: 22px;
		border-radius: 11px;
		background-color: #ccc;
		position: relative;
		transition: background-color 0.3s;
	}

	.switch.on {
		background-color: #007aff;
	}

	.switch-dot {
		position: absolute;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background-color: #fff;
		top: 2px;
		left: 2px;
		transition: transform 0.3s;
	}

	.switch.on .switch-dot {
		transform: translateX(18px);
	}

	/* 搜索优先级排序 */
	.priority-sort {
		display: flex;
		flex-direction: column;
	}

	.sort-item {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding: 0 10px;
		margin-bottom: 8px;
		border: 1px solid #eee;
		border-radius: 8px;
	}

	.sort-index {
		width: 20px;
		height: 20px;
		line-height: 20px;
		text-align: center;
		background-color: #f0f0f0;
		border-radius: 50%;
		font-size: 12px;
		margin-right: 10px;
	}

	.sort-name {
		flex: 1;
		font-size: 14px;
		height: 20px;
	}

	.sort-handle {
		width: 20px;
		text-align: center;
		color: #888;
	}

	/* 搜索数量设置 */
	.search-count {
		display: flex;
		align-items: center;
		width: 120px;
	}

	.count-btn {
		width: 30px;
		height: 30px;
		line-height: 30px;
		text-align: center;
		background-color: #f0f0f0;
		border-radius: 50%;
		font-size: 16px;
	}

	.count-value {
		flex: 1;
		text-align: center;
		font-size: 16px;
	}

	/* 歌词格式选项 */
	.format-options {
		display: flex;
	}

	.format-option {
		flex: 1;
		height: 36px;
		line-height: 36px;
		text-align: center;
		border: 1px solid #ddd;
		font-size: 14px;
	}

	.format-option:first-child {
		border-radius: 8px 0 0 8px;
	}

	.format-option:last-child {
		border-radius: 0 8px 8px 0;
	}

	.format-option.active {
		background-color: #007aff;
		color: #fff;
		border-color: #007aff;
	}

	/* 开关选项 */
	.toggle-option {
		display: flex;
		justify-content: flex-end;
	}

	/* 保存按钮 */
	.save-btn {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 50px;
		line-height: 50px;
		text-align: center;
		background-color: #007aff;
		color: #fff;
		font-size: 16px;
		font-weight: bold;
	}
</style>