<template>
  <div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      code: 'SZ002567',
    }
  },
  mounted() {
    return
    const socketUrl = this.getSocketUrl()
    let socket = new WebSocket(socketUrl);
    const sendMessage = function(data) {
      const final = JSON.stringify([JSON.stringify(data)])
      socket.send(final)
    }

    socket.onopen = function() {

    }
    socket.onmessage = event => {
      // 961728, 离岸人民币
      const response = event.data
      if (response === 'o') {
        const data = {
          "_event": "bulk-subscribe",
          "tzID": 28,
          "message": "pid-1:%%pid-2:%%pid-3:%%pid-5:%%pid-7:%%pid-9:%%pid-10:%%pidTechSumm-1:%%pidTechSumm-2:%%pidTechSumm-3:%%pidTechSumm-5:%%pidTechSumm-7:%%pidTechSumm-9:%%pidTechSumm-10:%%pid-961728:%%pid-40820:%%pid-28930:%%pid-179:%%pid-178:%%pid-8873:%%pid-8839:%%pid-8827:%%pidExt-961728:%%isOpenExch-1002:%%isOpenExch-54:%%isOpenExch-21:%%isOpenExch-20:%%isOpenPair-8873:%%isOpenPair-8839:%%isOpenPair-8827:%%cmt-6-5-961728:%%domain-6:"
        }
        sendMessage(data)
        sendMessage({"_event":"UID","UID":0})

        // 设置heartBeat
        setInterval(_ => {
          sendMessage({"_event":"heartbeat","data":"h"})
        }, 4 * 1000)
      } else {
        if (response[0] === 'a') {
          const model = JSON.parse(JSON.parse(response.substring(1)))
          if (model.message) {
            const content = model.message.substring(model.message.indexOf('::') + 2)
            this.handleMessage(JSON.parse(content))
          }

        } else {
          this.$message.error(response)
        }
      }

    }
  },
  methods: {
    handleMessage(data) {
      console.warn(data)
    },
    getSocketUrl() {
      const random_number_string = function(a) {
        var b = ("" + (a - 1)).length;
        return (Array(b + 1).join("0") + random_number(a)).slice(-b)
      }

      const random_number = function(a) {
        return Math.floor(Math.random() * a)
      }

      var g = "abcdefghijklmnopqrstuvwxyz0123456789_";
      const random_string = function(a, b) {
        b = b || g.length;
        var c, d = [];
        for (c = 0; c < a; c++)
          d.push(g.substr(Math.floor(Math.random() * b), 1));
        return d.join("")
      }
      return `wss://stream6.forexpros.com/echo/${ random_number_string(1e3)}/${random_string(8)}/websocket`
    }
  },
  components: {
  }
}
</script>
