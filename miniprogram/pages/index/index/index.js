// miniprogram/pages/my/my.js
wx.cloud.init();
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      hidden: false,
      hiddenLoading: false,
      hasMore: true,
      cnews: [],
      counter: 1,
      news: [],
      count: 1,
      news1: [],
      count1: 1,
      show: false,
      active1: '',
      active2: '',
      focus: false,
      placeholder: '请输入想要搜索的内容',
      num: 0,
      datas: {},
      title: 'news',
      num: 1,
    },
     /**
     * 从数据库获取每次要求获取的数据并保存到data.news中
     */
    
    imgCheck: function(images, new_id, title) { // 检查图片是否和合法
      // console.log(images)
      wx.cloud.callFunction({
        name: 'imgCheck',
        data: {
          images
        }
      }).then(res => {
        // console.log(res);
        // console.log(JSON.parse(res.result.body))
        let result = JSON.parse(res.result.body);
        let results = result.result_list;
        // console.log(results.result_list)
        // console.log(results)
        if(results){
          for(res of results) {
            if(res.data.result == 1){
              // console('is porn image');
              db.collection(title).doc({
                new_id: new_id
              }).remove({
                success: function(res) {
                  wx.showToast({
                    title: '由于文章内含有非法信息已被删除!'
                  })
                }
              })
            }
          }
        }
      })
    },
    module: function(title) {
      let counter = this.data.counter
      // console.log(title)
      wx.cloud.callFunction({
        name: 'module',
        data: {
          counter: counter,
          title: title
        }
      }).then(res => {
        // console.log(res)
        let cnews = this.data.cnews
        let data = res.result.data
        // console.log(data)
        for(let i = 0; i < data.length; i++) {
          // console.log(data[i].date)
          data[i].date = data[i].date.slice(0, 10)
          cnews.push(data[i])
          this.imgCheck(data[i].images, data.new_id, title)
        }
        // console.log(data)
        this.setData({
          hiddenLoading: true,
          cnews: cnews,
          counter: counter+1
        })
      })
    },
    onChange(event) { // 获取tab改变事件来使获取不同主题的新闻
      console.log(event)
      // console.log(this.data.active.one);

      let index = event.detail.index;
      let title = event.detail.title;
      // let active1 = this.data.active1;
      let cnews = this.data.cnews;
      let counter = this.data.counter;
      let active1 = this.data.active1;
      let active2 = this.data.active2;
      // console.log(active1 + "ac", active2)
      // console.log(title)
      this.setData({
        cnews: [],
        counter: 1
      })
      if(title == "财经"){
        this.setData({
          title: 'finance',
          active2: 'finance'
        })
        if(active1 != 'finance'){
          this.setData({
            news: cnews,
            count: counter,
            hiddenLoading: false,
          })
          this.module('finance')
        }
      }else if(title == "股票"){
        this.setData({
          title: 'stock',
          active2: 'stock',
        })
        if(active1 != 'stock'){
          this.setData({
            news: cnews,
            count: counter,
            hiddenLoading: false,
          })
          this.module('stock')
        }
      }else if(title == "军事"){
        this.setData({
          title: 'military',
          active2: 'military'
        })
        if(active1 != 'military'){
          this.setData({
            news: cnews,
            count: counter,
            hiddenLoading: false,
          })
          this.module('military')
        }
      }else if(title == "推荐"){
        this.setData({
          title: 'news',
          active2: 'news'
        })
        if(active1 != 'news'){
          this.setData({
            news: cnews,
            count: counter,
            hiddenLoading: false,
          })
          this.module('news')
        }
      }
      console.log(this.data.active1, this.data.active2);
            // console.log(active)
      // console.log(this.data.actives);
      // wx.showToast({
      //   title: `切换到标签 ${event.detail.index + 1}`,
      //   icon: 'none'
      // });
    },
    getTopping: function() { // 获取置顶的新闻 
      wx.cloud.callFunction({
        name: 'getTopping'
      }).then(res => {
        let top = res.result.data[0]
        // console.log(top)
        this.setData({
          topTitle: top.title,
          topContent: top.content,
          images: top.images,
          topComment: top.comments,
          topAuthor: top.author,
          topDate: top.date.slice(0,10)
        })
      })
    },
    showDetail: function(e) { // 点文章显示文章详情
      let item = e.currentTarget.dataset.item;
      let title = this.data.title;
      // console.log(e)
      wx.navigateTo({
        url:`../detail/detail?contentId=${item}&title=${title}`
      })
    },
    showMore: function(e){
      let show = this.data.show
      this.setData({
        show: !show
      })
    },
    navigateToSearch: function() {
      // wx.navigateTo({
      //   url: '../search/search'
      // })
      let num = this.data.num;
      let datas = this.data.datas[0];
      // console.log(datas[0])
      if(num == 5) {
        this.setData({
          num: 0
        })
        num = 0
      }
      this.setData({
        placeholder: datas[num],
        num: num + 1
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getTopping()
      // this.getDatas("getData")
      this.module('news');
      this.setData({
        active1: 'news'
      })
      db.collection('hots').get()
        .then(res => {
          this.setData({
            datas: res.data
          })
          // console.log(res.data[0])
        });
    },
  
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
  
    },
  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      let active2 = this.data.active2;
      this.setData({
        active1: active2,
      })
    },
  
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { // 监听下拉动作来获取最新新闻信息
      wx.showToast({
        title: '推荐中',
        image: '../../../image/加载.png'
      })
      let title = this.data.title;
      wx.cloud.callFunction({
        name: 'module',
        data: {
          counter: 1,
          title: title
        }
      }).then(res => {
        // console.log(res)
        let cnews = this.data.cnews
        let datas = res.result.data
        let data = datas.concat(cnews)
        this.setData({
          hiddenLoading: true,
          cnews: data,
        })
      })
    },
  
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () { // 上拉显示更多新闻
      wx.showToast({
        title: '加载更多',
        image: '../../../image/加载.png'
      })
      // this.getDatas("getData")
      let title = this.data.title
      if(title){
        this.module(title)
      }
    },
  
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
      
    }
  })