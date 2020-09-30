<template>
  <div id="app">
      <el-row :gutter="18">
        <el-col :span="6">
          <el-input
                  type="text"
                  v-model="etcdAddr"
                  placeholder="请输入etcd地址"
                  @keyup.native.enter="connectEtcd"
          ></el-input>
        </el-col>
        <el-col :span="1">
          <el-button icon="el-icon-s-promotion" @click="connectEtcd"></el-button>
        </el-col>
        <el-col :span="1">
          <el-button icon="el-icon-check" @click="saveToEtcd">保存</el-button>
        </el-col>
        <el-col :span="8">
          <div style="color:red;margin-top:10px;font-size:large">{{ this.treeNodeData.value }}</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-tree
                  class="dir-tree"
                  node-key="value"
                  :data="datas"
                  @node-click="clickTreeNode"
                  @node-contextmenu="rightClickTreeNode"
          >
          </el-tree>
        </el-col>
        <el-col :span="16">
          <div>
            <vue-json-editor v-if="etcdValueIsObject" v-model="etcdValue" :show-btns="false" :expandedOnStart="true"></vue-json-editor>
            <el-input v-if="!etcdValueIsObject" class="display-content" type="textarea" v-model="etcdValue" :autosize="{minRows:35, maxRows:100}"></el-input>
          </div>
        </el-col>
      </el-row>
    </div>
</template>
<script>
  import axios from 'axios';
  import vueJsonEditor from 'vue-json-editor'
  export default {
    data: function() {
      return {
        etcdAddr: 'http://10.10.104.223:3379/v2/keys',
        etcdValue: {},
        datas:[],
        defaultProps:{
          children: 'children',
          label: 'label'
        },
        treeNodeData: {}
      }
    },
    components: {
      vueJsonEditor
    },
    methods: {
      clickTreeNode:function(data, node) {
        this.treeNodeData = data;
        this.etcdValue = "";
        axios.get(this.etcdAddr + "/" + data.value)
                .then((resp)=>{
                  if (data.isDir) {
                    data.children = [];
                    resp.data.node.nodes.forEach((v)=>{
                      data.children.push({label:v.key.substr(v.key.lastIndexOf("/")+1),isDir:v.dir,value:v.key,children:[]})
                      data.children.sort((left,right)=>{
                        if (left.label > right.label) {
                          return 1
                        }
                        return -1
                      })
                    });
                    node.expand();
                  } else {
                    if (this.isJson(resp.data.node.value)) {
                      this.etcdValue = JSON.parse(resp.data.node.value);
                    } else {
                      this.etcdValue = resp.data.node.value;
                    }
                  }
                })
                .catch(function(){
                  //alert(err)
                })
      },
      connectEtcd: function() {
        this.datas = [];
        axios.get(this.etcdAddr)
                .then((resp)=>{
                  resp.data.node.nodes.forEach((v)=>{
                    this.datas.push({label:v.key.substr(v.key.lastIndexOf("/")+1),isDir:v.dir,value:v.key,children:[]})
                  });
                })
                .catch(function(err){
                  alert(err)
                })
      },
      rightClickTreeNode: function(event,data) {
        console.log(event, data);
      },
      saveToEtcd: function() {
        console.log(this.etcdValue);
        let val="";
        if (this.etcdValueIsObject) {
          val = JSON.stringify(this.etcdValue)
        } else {
          val = this.etcdValue
        }
        axios.put(this.etcdAddr + this.treeNodeData.value, "value="+val)
                .then((resp)=>{
                  alert(JSON.stringify(resp.data))
                })
                .catch(function(err) {
                  alert(err)
                })
      },
      isJson: function(str) {
        try {
          if (typeof JSON.parse(str) == "object") {
            return true
          }
        } catch(e) {
          //alert(e)
        }
        return false
      },
    },
    computed: {
      etcdValueIsObject:function() {
        return typeof this.etcdValue == "object";
      }
    }
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
    height:100%;
  }

  .dir-tree {
    border-style:solid;
    border-width:1px;
    height:calc(90vh);
    overflow-y:auto;
    overflow-x:scroll;
  }
  .el-row {
    margin-bottom: 20px;
  }

  html,body,#app,.el-container{
    padding: 0px;
    margin: 4px;
    height: 100%;
  }
  .jsoneditor-vue{
    height:calc(90vh);
  }
  .display-content{
    height:calc(90vh);
  }

</style>
