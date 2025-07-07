if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const neteaseSearchSongs = (keywords, limit) => {
    return uni.request({
      url: "https://apis.netstart.cn/music/search?keywords=" + keywords + "&limit=" + limit
    }).then((res) => {
      let searchResults = res.data;
      if (searchResults != null) {
        let searchSongs = [];
        let songs = searchResults["result"]["songs"];
        songs.forEach((song) => {
          let artists = "";
          song["artists"].forEach((artist) => {
            artists += " / " + artist["name"];
          });
          artists = artists.slice(3);
          searchSongs.push({
            id: song["id"],
            name: song["name"],
            artists,
            album: song["album"]["name"],
            platform: "网易云音乐"
          });
        });
        return searchSongs;
      } else
        return [];
    }).catch((err) => {
      return [];
    });
  };
  const neteaseGetLyric = (songId) => {
    return uni.request({
      url: "https://apis.netstart.cn/music/lyric?id=" + songId
    }).then((res) => {
      let lyricData = res.data;
      let lyric = lyricData["lrc"]["lyric"];
      let tlyric = "";
      if ("tlyric" in lyricData && lyricData["tlyric"]["lyric"].length > 0) {
        tlyric = lyricData["tlyric"]["lyric"];
      }
      return {
        lyric,
        tlyric
      };
    });
  };
  const ON_LOAD = "onLoad";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const qqSearchSongs = (keywords, limit) => {
    return uni.request({
      url: "https://api.vkeys.cn/v2/music/tencent/search/song?word=" + keywords + "&num=" + limit
    }).then((res) => {
      const searchResults = res.data;
      formatAppLog("log", "at api/qqMusicApi.js:6", searchResults);
      if (searchResults != null) {
        const searchSongs = [];
        const songs = searchResults["data"];
        songs.forEach((song) => {
          let singers = "";
          song["singer_list"].forEach((singer) => {
            singers += " / " + singer["name"];
          });
          singers = singers.slice(3);
          searchSongs.push({
            id: song["mid"],
            name: song["song"],
            artists: singers,
            album: song["album"],
            platform: "QQ音乐"
          });
        });
        return searchSongs;
      } else
        return [];
    }).catch((err) => {
      return [];
    });
  };
  const qqGetLyric = (songId) => {
    return uni.request({
      url: "https://api.vkeys.cn/v2/music/tencent/lyric?mid=" + songId
    }).then((res) => {
      const lyricData = res.data["data"];
      const lyric = lyricData["lrc"];
      let trans = "";
      if ("trans" in lyricData && lyricData["trans"].length > 0) {
        trans = lyricData["trans"];
      }
      return {
        lyric,
        tlyric: trans
      };
    });
  };
  const _imports_0 = "/static/info.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const neteaseLimit = 5;
  const qqLimit = 5;
  const _sfc_main$2 = {
    __name: "index",
    setup(__props, { expose: __expose }) {
      __expose();
      let searchSongs = vue.ref([]);
      const songInfo = vue.ref("");
      const artistName = vue.ref("");
      const songUrl = vue.ref("");
      async function handleSearch() {
        if (songInfo.value.length == 0)
          return;
        uni.showLoading({
          title: "搜索中..."
        });
        searchSongs.value.splice(0, searchSongs.value.length);
        const neteaseSongs = await neteaseSearchSongs(songInfo.value, neteaseLimit);
        const qqSongs = await qqSearchSongs(songInfo.value, qqLimit);
        neteaseSongs.forEach((song) => {
          searchSongs.value.push(song);
        });
        qqSongs.forEach((song) => {
          searchSongs.value.push(song);
        });
        uni.hideLoading();
      }
      async function toLyricPreview(song) {
        uni.navigateTo({
          url: "/pages/LyricPreview/LyricPreview?song=" + JSON.stringify(song)
        });
      }
      const getPlatformIcon = (platform) => {
        switch (platform) {
          case "网易云音乐":
            return "/static/netease.png";
          case "QQ音乐":
            return "/static/qq.png";
          case "酷狗音乐":
            return "/static/kugou.png";
          default:
            return "spinner-cycle";
        }
      };
      const __returned__ = { get searchSongs() {
        return searchSongs;
      }, set searchSongs(v) {
        searchSongs = v;
      }, songInfo, artistName, songUrl, neteaseLimit, qqLimit, handleSearch, toLyricPreview, getPlatformIcon, ref: vue.ref, get neteaseSearchSongs() {
        return neteaseSearchSongs;
      }, get neteaseGetLyric() {
        return neteaseGetLyric;
      }, get qqSearchSongs() {
        return qqSearchSongs;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 搜索区域 "),
      vue.createElementVNode("view", { class: "search-section" }, [
        vue.createElementVNode("view", { class: "search-form" }, [
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.songInfo = $event),
                placeholder: "请输入歌曲信息",
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.songInfo]
            ]),
            vue.createElementVNode("button", {
              type: "primary",
              onClick: $setup.handleSearch,
              class: "search-btn"
            }, " 搜索 ")
          ])
        ])
      ]),
      vue.createCommentVNode(" 搜索结果区域 "),
      vue.createElementVNode("view", { class: "result-section" }, [
        $setup.searchSongs.length ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "result-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.searchSongs, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: item.id,
                class: "result-card",
                onClick: ($event) => $setup.toLyricPreview(item)
              }, [
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "song-name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "platform-tag" }, [
                    vue.createElementVNode("image", {
                      src: $setup.getPlatformIcon(item.platform),
                      class: "platform-icon"
                    }, null, 8, ["src"]),
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString(item.platform),
                      1
                      /* TEXT */
                    )
                  ])
                ]),
                vue.createElementVNode("view", { class: "card-content" }, [
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "歌手："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(item.artists),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-item" }, [
                    vue.createElementVNode("text", { class: "label" }, "专辑："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(item.album),
                      1
                      /* TEXT */
                    )
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "no-result"
        }, [
          vue.createElementVNode("image", {
            src: _imports_0,
            class: "no-result-icon"
          }),
          vue.createElementVNode("text", null, "暂无搜索结果")
        ]))
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/zfh10/Desktop/uniapp/LyricAcquirer/LyricAcquirer/pages/index/index.vue"]]);
  const handleLyric = (lyric, tlyric) => {
    if (tlyric.length == 0)
      return lyric.trim().replace(/\/\//g, "");
    const lyricLines = lyric.split("\n");
    const tlyricLines = tlyric.split("\n");
    const lyricMap = {};
    for (const line of lyricLines) {
      const match = line.match(/^(\[.*?\])/);
      if (match) {
        const timestamp = match[1];
        const text = line.slice(timestamp.length).trim();
        if (!lyricMap[timestamp]) {
          lyricMap[timestamp] = {
            lyric: text,
            tlyric: ""
          };
        } else {
          lyricMap[timestamp].lyric = text;
        }
      }
    }
    for (const line of tlyricLines) {
      const match = line.match(/^(\[.*?\])/);
      if (match) {
        const timestamp = match[1];
        const text = line.slice(timestamp.length).trim();
        if (!lyricMap[timestamp]) {
          lyricMap[timestamp] = {
            lyric: "",
            tlyric: text
          };
        } else {
          lyricMap[timestamp].tlyric = text;
        }
      }
    }
    const sortedTimestamps = Object.keys(lyricMap).sort();
    let output = "";
    for (const timestamp of sortedTimestamps) {
      const {
        lyric: lyric2,
        tlyric: tlyric2
      } = lyricMap[timestamp];
      if (lyric2) {
        output += `${timestamp} ${lyric2}
`;
      }
      if (tlyric2) {
        output += `${timestamp} ${tlyric2}
`;
      }
    }
    return output.trim().replace(/\/\//g, "");
  };
  const saveFile = async (content, filename) => {
    await saveForApp(content, filename);
  };
  const saveForApp = async (content, filename) => {
    try {
      const tempPath = `${plus.io.PUBLIC_DOWNLOADS}/${filename}`;
      await writeFile(tempPath, content);
      uni.showToast({
        title: `保存成功`,
        duration: 1500
      });
    } catch (error) {
      uni.showModal({
        content: "保存失败：" + error.message,
        showCancel: false
      });
    }
  };
  const writeFile = (path, content) => {
    return new Promise((resolve, reject) => {
      plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, (fs) => {
        fs.root.getFile(
          path,
          {
            create: true
          },
          (fileEntry) => {
            fileEntry.createWriter((writer) => {
              writer.onwriteend = resolve;
              writer.onerror = reject;
              writer.write(content);
            }, reject);
          },
          reject
        );
      }, reject);
    });
  };
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "LyricPreview",
    setup(__props, { expose: __expose }) {
      __expose();
      const isDownloading = vue.ref(false);
      let lyricGroups = vue.ref([
        {
          time: "",
          lines: []
        }
      ]);
      let lyricText = "";
      let filename = "";
      const handleDownload = async () => {
        if (isDownloading.value)
          return;
        isDownloading.value = true;
        uni.showLoading({
          title: "下载歌词中..."
        });
        await saveFile(lyricText, filename);
        isDownloading.value = false;
        uni.hideLoading();
      };
      async function getSongLyric(song) {
        let lyricData = null;
        if (song.platform == "网易云音乐") {
          lyricData = await neteaseGetLyric(song.id);
        } else if (song.platform == "QQ音乐") {
          lyricData = await qqGetLyric(song.id);
        }
        if (lyricData != null) {
          const lyric = lyricData["lyric"];
          const tlyric = lyricData["tlyric"];
          const translateLyric = handleLyric(lyric, tlyric);
          lyricText = translateLyric;
          return translateLyric;
        }
      }
      onLoad((option) => {
        const song = JSON.parse(option.song);
        filename = song.artists.replace(/ \/ /, ",") + " - " + song.name + ".lrc";
        uni.showLoading({
          title: "获取歌词中..."
        });
        getSongLyric(song).then((res) => {
          parseLyrics(res);
          uni.hideLoading();
        });
      });
      const parseLyrics = (lyricStr) => {
        const groups = [];
        let currentTime = "";
        lyricStr.split("\n").forEach((line) => {
          const match = line.match(/^(\[.*?\])/);
          if (match) {
            currentTime = match[1];
            groups.push({
              time: currentTime,
              lines: [line.replace(match[0], "").trim()]
            });
          } else if (currentTime && line.trim()) {
            groups[groups.length - 1].lines.push(line.trim());
          }
        });
        const merged = [];
        groups.forEach((group) => {
          const last = merged[merged.length - 1];
          if ((last == null ? void 0 : last.time) === group.time) {
            last.lines.push(...group.lines);
          } else {
            merged.push(group);
          }
        });
        lyricGroups.value = merged;
      };
      const __returned__ = { isDownloading, get lyricGroups() {
        return lyricGroups;
      }, set lyricGroups(v) {
        lyricGroups = v;
      }, get lyricText() {
        return lyricText;
      }, set lyricText(v) {
        lyricText = v;
      }, get filename() {
        return filename;
      }, set filename(v) {
        filename = v;
      }, handleDownload, getSongLyric, parseLyrics };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "lyrics-container" }, [
      vue.createElementVNode("scroll-view", {
        class: "lyrics-scroll",
        "scroll-y": ""
      }, [
        vue.createElementVNode("view", { class: "lyrics-content" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.lyricGroups, (group, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "lyrics-block",
                key: index
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(group.lines, (line, count) => {
                    return vue.openBlock(), vue.createElementBlock("view", null, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["lyrics-line", count == 0 ? "original" : "translation"])
                        },
                        vue.toDisplayString(line),
                        3
                        /* TEXT, CLASS */
                      )
                    ]);
                  }),
                  256
                  /* UNKEYED_FRAGMENT */
                ))
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-area" }, [
        vue.createElementVNode("button", {
          class: "download-btn",
          type: "primary",
          loading: $setup.isDownloading,
          onClick: $setup.handleDownload
        }, [
          vue.createElementVNode(
            "text",
            { class: "btn-text" },
            vue.toDisplayString($setup.isDownloading ? "下载中..." : "下载歌词"),
            1
            /* TEXT */
          )
        ], 8, ["loading"])
      ])
    ]);
  }
  const PagesLyricPreviewLyricPreview = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/zfh10/Desktop/uniapp/LyricAcquirer/LyricAcquirer/pages/LyricPreview/LyricPreview.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/LyricPreview/LyricPreview", PagesLyricPreviewLyricPreview);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/zfh10/Desktop/uniapp/LyricAcquirer/LyricAcquirer/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
