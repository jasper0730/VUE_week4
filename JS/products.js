import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';
import pagination from './pagination.js'; // 區域元件,載入另一支JS的匯入方法

const site = 'https://vue3-course-api.hexschool.io/v2'
const api_path = 'jasper07301'

let productModal = {};
let delModal = {};

const app = createApp({
    components: {
        pagination
    },
    data() {
        return {
            products:[],
            tempData:{
                imagesUrl:[]
            },
            isAdd: false,
            pagination: {},
        }
    },
    methods: {
        checkLogin() {
            const url = `${site}/api/user/check`;
            const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
            axios.defaults.headers.common.Authorization = token;
            axios.post(url)
                .then(() => {
                    this.getData();
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        getData(page = 1) { // 預設值為1,若未傳入page就會帶入預設值
            const url = `${site}/api/${api_path}/admin/products/?page=${page}`;
            axios.get(url)
                .then((res)=>{
                    this.products = res.data.products;  
                    this.pagination = res.data.pagination;
                })
                .catch((err) => {
                    alert(err.data.message)
                })
        },
        openModal(status, item) {
            if(status === 'isNew') {
                // 如果點到的是新增產品,就先將tempData內的資料先清空初始化
                this.tempData = {
                    imagesUrl:[]
                };
                productModal.show();
                // 這裡的isAdd是為了判斷點擊確認時要新增還是編輯
                this.isAdd = true;
            }else if(status === 'edit') {
                this.tempData = JSON.parse(JSON.stringify(item));
                productModal.show();
                this.isAdd = false;
            }else if(status === 'delete') {
                this.tempData = JSON.parse(JSON.stringify(item));
                delModal.show();
            }
            
        },
        
    },
    mounted() {
        this.checkLogin();
        productModal = new bootstrap.Modal(document.getElementById('productModal'), {
            keyboard: false
        });
        delModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
            keyboard: false
        });

    },
})
// 新增、編輯的modal元件
app.component('productModal',{
    props:['tempData','isNew'], // 自定義的名稱,需與本元件的參數名稱相同
    template:`#templateForProductModal`, // 對應html的template
    methods:{
        updateData() {
            // 預設為新增的axios
            let url = `${site}/api/${api_path}/admin/product`;  // 新增的axios
            let method = 'post'; 
            // 如果點擊後isNew為false則等於觸發編輯的axios
            if(!this.isNew) {
                url = `${site}/api/${api_path}/admin/product/${this.tempData.id}`;  // 編輯的axios
                method = 'put'; 
            }
            axios[method](url,{data: this.tempData})
                .then((res)=>{
                    productModal.hide();
                    this.$emit('get-data') // 自定義名稱,要使用外層元件的方法
                })
                .catch((err) => {
                    alert(err.data.message)
                })
        },
    }
})
// 刪除的modal元件
app.component('delProductModal',{
    props:['tempData'],
    template:`#templateForDelProductModal`, // 對應html的template
    methods:{
        deleteData() {
            const url = `${site}/api/${api_path}/admin/product/${this.tempData.id}`;
            axios.delete(url)
                .then((res)=>{
                    delModal.hide();
                    this.$emit('get-data')
                })
                .catch((err) => {
                    alert(err.data.message)
                })
        },
    }
})

app.mount('#app')