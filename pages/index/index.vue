<template>
	<view class="container" @click.stop="closeMenu">

		<view class="custom-navbar">
			<view class="navbar-more"></view>
			<view class="navbar-title">歌词搜索</view>
			<view class="navbar-more" @click.stop="toggleMenu">
				<view class="more-icon">
					<view class="dot"></view>
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
			</view>
			<!-- 功能菜单 -->
			<view v-if="showMenu" class="menu-popup" @click.stop="closeMenu">
				<view class="menu-item" @click="handleMenuClick('setting')">
					<image src="/static/settings.png" class="menu-item-image" mode="widthFix"></image>
					<view class="menu-item-text">设置</view>
				</view>
				<view class="menu-item" @click="handleMenuClick('about')">
					<image src="/static/info.png" class="menu-item-image" mode="widthFix"></image>
					<view class="menu-item-text">关于</view>
				</view>
			</view>
		</view>
		<!-- 搜索区域 -->
		<view class="search-section">
			<view class="search-form">
				<view class="input-group">
					<input v-model="songInfo" placeholder="请输入歌曲信息" class="input" />
					<button type="primary" @click="handleSearch" class="search-btn">
						搜索
					</button>
				</view>
			</view>
		</view>
		<!-- 搜索结果区域 -->
		<view class="result-section">
			<view class="result-list" v-if="searchSongs.length">
				<view v-for="(item, index) in searchSongs" :key="item.id" class="result-card"
					@click="toLyricPreview(item)">
					<view class="card-header">
						<view class="song-name">{{ item.name }}</view>
						<view class="platform-tag">
							<image :src="getPlatformIcon(item.platform)" class="platform-icon"></image>
							<text>{{ item.platform }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="info-item">
							<text class="label">歌手：</text>
							<text class="value">{{ item.artists }}</text>
						</view>
						<view class="info-item">
							<text class="label">专辑：</text>
							<text class="value">{{ item.album }}</text>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="no-result">
				<image src="/static/searchInfo.png" class="no-result-icon"></image>
				<text>暂无搜索结果</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from "vue";
	import {
		onShow
	} from '@dcloudio/uni-app'
	import {
		neteaseSearchSongs
	} from "../../api/neteaseMusicApi.js"
	import {
		qqSearchSongs
	} from "../../api/qqMusicApi.js"

	// ============ 页面数据定义 ============

	/** 状态栏高度，用于适配App端的状态栏 */
	const statusBarHeight = ref(0)

	/** 搜索结果列表 */
	let searchSongs = ref([])

	/** 用户输入的歌曲信息 */
	const songInfo = ref('');

	const artistName = ref('');
	const songUrl = ref('');

	/** 网易云音乐搜索数量限制 */
	let neteaseLimit = ref(5)

	/** QQ音乐搜索数量限制 */
	let qqLimit = ref(5)

	/** 各平台的启用状态 */
	let enabledPlatforms = ref({
		netease: true,
		qq: true
	})

	/** 平台搜索优先级顺序，数组中靠前的平台优先显示结果 */
	let platformOrder = ref(['netease', 'qq'])

	// ============ 设置管理 ============

	/**
	 * 从本地存储加载用户设置
	 * 读取的设置包括：
	 * - searchCounts: 各平台搜索数量限制
	 * - searchPlatforms: 平台启用状态
	 * - platformOrder: 平台搜索优先级顺序
	 */
	const loadSettings = () => {
		uni.getStorage({
			key: 'appSettings',
			success: (res) => {
				const settings = res.data
				if (settings) {
					// 读取搜索数量设置
					if (settings.searchCounts) {
						neteaseLimit.value = settings.searchCounts.netease || 5
						qqLimit.value = settings.searchCounts.qq || 5
					}
					// 读取平台启用状态
					if (settings.searchPlatforms) {
						enabledPlatforms.value = settings.searchPlatforms
					}
					// 读取平台优先级顺序
					if (settings.platformOrder) {
						platformOrder.value = settings.platformOrder
					}
				}
			}
		})
	}

	/**
	 * 页面显示时加载设置
	 * 每次从设置页面返回时，都会重新加载最新的设置
	 */
	onShow(() => {
		loadSettings()
	})

	/**
	 * 组件挂载时获取状态栏高度
	 */
	onMounted(() => {
		// 获取系统信息，读取状态栏高度
		const systemInfo = uni.getSystemInfoSync()
		statusBarHeight.value = systemInfo.statusBarHeight || 0
	})

	// ============ 搜索功能 ============

	/**
	 * 执行搜索操作
	 * 根据用户设置，按照优先级顺序搜索启用的平台
	 * 搜索结果按照平台优先级排序显示
	 */
	async function handleSearch() {
		// 验证输入不为空
		if (songInfo.value.length == 0) return

		// 显示加载提示
		uni.showLoading({
			title: '搜索中...'
		})

		// 清空之前的搜索结果
		searchSongs.value.splice(0, searchSongs.value.length)

		// 构建平台搜索函数映射表
		const searchPromises = []
		const platformMap = {
			netease: () => neteaseSearchSongs(songInfo.value, neteaseLimit.value),
			qq: () => qqSearchSongs(songInfo.value, qqLimit.value)
		}

		// 按照设置的优先级顺序构建搜索请求
		// 只搜索已启用的平台
		for (const platform of platformOrder.value) {
			if (enabledPlatforms.value[platform] && platformMap[platform]) {
				// 将平台标识和搜索结果一起返回，便于按顺序合并
				searchPromises.push(
					platformMap[platform]().then(songs => ({
						platform,
						songs
					}))
				)
			}
		}

		// 并发执行所有搜索请求
		const results = await Promise.all(searchPromises)

		// 按照平台优先级顺序合并搜索结果
		results.forEach(({
			platform,
			songs
		}) => {
			songs.forEach((song) => {
				searchSongs.value.push(song)
			})
		})

		// 隐藏加载提示
		uni.hideLoading()
	};

	/**
	 * 跳转到歌词预览页面
	 * @param {Object} song - 歌曲信息对象
	 */
	async function toLyricPreview(song) {
		uni.navigateTo({
			url: "/pages/LyricPreview/LyricPreview?song=" + JSON.stringify(song)
		})
	}

	/**
	 * 根据平台名称获取对应的图标
	 * @param {string} platform - 平台名称
	 * @returns {string} 图标路径
	 */
	const getPlatformIcon = (platform) => {
		switch (platform) {
			case '网易云音乐':
				return '/static/netease.png';
			case 'QQ音乐':
				return '/static/qq.png';
			case '酷狗音乐':
				return '/static/kugou.png'
			default:
				return 'spinner-cycle';
		}
	}

	// ============ 菜单功能 ============

	/** 菜单显示状态 */
	const showMenu = ref(false);

	/**
	 * 切换菜单显示/隐藏
	 */
	const toggleMenu = () => {
		showMenu.value = !showMenu.value;
	};

	/**
	 * 关闭菜单
	 */
	const closeMenu = () => {
		showMenu.value = false;
	};

	/**
	 * 处理菜单项点击事件
	 * @param {string} type - 菜单类型（setting 或 about）
	 */
	const handleMenuClick = (type) => {
		closeMenu();
		if (type === 'setting') {
			// 跳转到设置页面
			uni.navigateTo({
				url: '/pages/settings/settings'
			});
		} else if (type === 'about') {
			// 跳转到关于页面
			uni.navigateTo({
				url: '/pages/about/about'
			});
		}
	};
</script>

<style scoped>
	page {
		height: 100%;
	}

	.custom-navbar {
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		z-index: 1000;
	}

	.navbar-title {
		font-size: 36rpx;
		font-weight: 550;
		color: #333;
	}

	.navbar-more {
		padding: 16rpx;
		width: 8rpx;
	}

	.more-icon {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.dot {
		width: 8rpx;
		height: 8rpx;
		background-color: #666;
		border-radius: 50%;
	}

	/* 功能菜单 */
	.menu-popup {
		position: absolute;
		right: 30rpx;
		top: calc(100rpx + var(--status-bar-height));
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
		min-width: 160rpx;
		z-index: 1001;
	}

	.menu-item {
		padding: 24rpx 32rpx;
		font-size: 28rpx;
		color: #333;
		border-bottom: 1rpx solid #eee;
		align-items: center;
		gap: 10rpx;
		justify-content: center;
		display: flex;
		flex-direction: row;
	}

	.menu-item-image {
		width: 40rpx;
	}

	.menu-item-text {
		font-size: 35rpx;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-item:active {
		background-color: #f5f5f5;
	}

	.container {
		background-color: #FFFFFF;
		padding: 30rpx;
		/* padding-top: calc(120rpx + var(--status-bar-height)); */
		padding-top: var(--status-bar-height);
		display: flex;
		flex-direction: column;
		height: 100%;
		box-sizing: border-box;
		/* --status-bar-height: 0px; */
	}

	.search-section {
		background-color: #E6F3FF;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		flex-shrink: 0;
	}

	.title {
		font-size: 36rpx;
		color: #1890FF;
		font-weight: bold;
		margin-bottom: 30rpx;
	}

	.search-form {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.input-group {
		display: flex;
		gap: 20rpx;
	}

	.input {
		flex: 1;
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 10px;
	}

	.exact-search-section {
		background-color: #E6F3FF;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		flex-shrink: 0;
	}

	.subtitle {
		font-size: 32rpx;
		color: #1890FF;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.url-input {
		flex: 1;
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 10px;
	}

	.search-btn {
		flex-shrink: 0;
		font-size: 15px;
		/* width: 160rpx; */
		margin: 0;
	}

	.result-section {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		overflow: hidden;
		flex: 1;
		overflow-y: auto;
	}

	.result-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding: 20rpx;
		/* min-height: 100%; */
	}

	.result-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
		padding: 24rpx;
		border: 2rpx solid #E6F3FF;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.song-name {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
		flex: 1;
		max-lines: 1;
		text-overflow: ellipsis;
	}

	.platform-tag {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background-color: #E6F3FF;
		padding: 8rpx 16rpx;
		border-radius: 24rpx;
	}

	.platform-tag text {
		font-size: 24rpx;
		color: #1890FF;
	}

	.platform-icon {
		width: 16px;
		height: 16px;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
	}

	.label {
		font-size: 28rpx;
		color: #666666;
		width: 100rpx;
		flex-shrink: 0;
	}

	.value {
		font-size: 28rpx;
		color: #333333;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.no-result {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		color: #999999;
		gap: 20rpx;
	}

	.no-result-icon {
		width: 30px;
		height: 30px;
	}
</style>