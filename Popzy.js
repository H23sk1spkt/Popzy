
const $$=document.querySelectorAll.bind(document)
const $=document.querySelector.bind(document)
// tói ưu code để xử lí gọn hơn p2
//chỉ cần nhán nó tự tạo ra nội dung tương ứng với nút bấm
//  <div class="popzy__backup ">
//          <div class="popzy__container">
//             <button  class="popzy__close">&times;</button>
//             <p class="popzy__content">1
//             </p>
//          </div>
//     </div>
Popzy.elements=[]
function Popzy(option= {}){
    // tạo ra 1 biến trong đó có các bên trái là gtri mặc định , bên phải là dữ liệu truyền vào , nếu có dữ liêu trùng thì sẽ đè lên dữ liệu con , và nếu ko có thì ko đè lên
    // this.opt  là thuộc tính của hàm ,còn const ... là biến cục bộ của hàm , chỉ hoạt động trong hàm tạo thôi
    this.opt=Object.assign({
        footer:false,
        destroyOnclose:true,
        closeModal: ["buttonModal","overlay","Escape"],
        cssElement:[],
        },option)
    this.template=$(`#${this.opt.templateId}`)
    if(!this.template){
        return console.error(`#${this.opt.templateId} does not exits`)
    }
    const {closeModal}=this.opt
    this._allowButtonclose=closeModal.includes("buttonModal")
    this._allowoverlayclose=closeModal.includes("overlay")
    this._allowEscapeclose=closeModal.includes("Escape")
    this._footerButton= []
    this._handleEscapeKey=this._handleEscapeKey.bind(this)

}
//ko nền dùng arrow function nếu bên trong có this , vì this nó sẽ lấy từ phương thức modal nên phải tạo hàm function
    Popzy.prototype._build=function()  {
        const content=this.template.content.cloneNode(true); // tạo ra 1 bảng sao 
        //create element từng phần tử
        this.backup=document.createElement("div")// tạo sẵn 1 cái backup từ this
        this.backup.className="popzy__backup"
        
        const container=document.createElement("div")
        container.className="popzy__background"
        this.opt.cssElement.forEach(css => {
            if(typeof css ==='string'){
                container.classList.add(css)
            }
        });
        if(this._allowButtonclose){
        const close=this._createButton("&times;","popzy__close",() => this.closeModal())// vì chỉ gọi hàm để  callback thôi ko phải truyền hàm
        // vì khi dùng this.modal tì bên hàm tạo phương thức tạo nút sẽ thành button.onclick() nên this.closeModal trỏ đến button chớ ko phải là modal
        container.append(close)
    }
        
        const mcontent=document.createElement("div")
        mcontent.className="popzy__content"
        
        //append 
        mcontent.append(content);
        container.append(mcontent);
        if(this.opt.footer){
            this._footerModal=document.createElement("div");
            this._footerModal.classList.add("popzy__footer")
            this._renderFooterModal();
            this._renderFooterButton();
            container.append(this._footerModal)
        }
        
        
        this.backup.append(container)
        document.body.append(this.backup)
    }
    Popzy.prototype.setFooterModal = function(html)  {
        this._footer=html
        this._renderFooterModal()
        
    }
    Popzy.prototype._createButton=function(title,cssClass,callback){
        const button =document.createElement("button");
        button.innerHTML=title,
        button.className=cssClass,
        button.onclick=callback
        return button
    }
    
    Popzy.prototype.addFooter=function(title,cssClass,callback){
        const button=this._createButton(title,cssClass,callback)
        this._footerButton.push(button);
        this._renderFooterButton();
    }// phair kiếm chỗ lưu
    // tối ưu rút gọn code
    Popzy.prototype._renderFooterButton=function() {
        if(this._footerModal){
            this._footerButton.forEach(button => {
                this._footerModal.append(button)
            })
        }
    }
    Popzy.prototype._renderFooterModal=function() {
        if(this._footerModal && this._footer){
            this._footerModal.innerHTML=this._footer
        }
    }

    Popzy.prototype.open=function() {
        Popzy.elements.push(this)
        if(!this.backup){
            this._build()
        }
        //attach
        setTimeout(()=> {
            this.backup.classList.add("popzy--show")
        },0)// chạy bất đồng bộ nên settimeou sẽ chạy cuối cùng
        this.ontransitionEnd(this.opt.onOpen)// đây là call back , sau khi callback được duyệt , nó sẽ duyệt hàm onOpen ở trong , tổng alf nó sẽ duyệt 2 lần
        if(this._allowoverlayclose){
        this.backup.onclick=(e)=> {
            if(e.target===this.backup){
                this.closeModal()
            }}
        }
        if(this._allowEscapeclose){
        document.addEventListener("keydown",this._handleEscapeKey )
        }
        document.body.style.overflow="hidden"
        document.body.style.paddingRight=this._getscrollbar()+'px' // thêm padding để nó giữ ngueyen vị trí khi mât thanh cuộn
        return this.backup
    }
        Popzy.prototype._handleEscapeKey= function(e)  {
            // console.log(this); khi chưa dùng đin this nó sẽ trỏ vào documnet 
            console.log(this);
            

            
            const lastModal=Popzy.elements[Popzy.elements.length-1]
            if (e.key === "Escape" && this===lastModal) {
                this.closeModal();
            }// do cái này  người dùng nhấn thì nó xóa hết các modal đang mở mà có thuộc tính "escape" nên xử lí rieng cái này

}
        Popzy.prototype.ontransitionEnd=function(callback) {
            this.backup.ontransitionend=(e)=> {
                if(e.propertyName!=="transform"){
                    return
                }
                if(typeof callback==="function"){
                    callback()
                }
            }
        }
        //tách hàm 
        Popzy.prototype.closeModal=function(destroy=this.opt.destroyOnclose) {
            Popzy.elements.pop()// để xóa phần tử cuối cùng
            this.backup.classList.remove("popzy--show");
            if(this._allowEscapeclose){
                document.removeEventListener("keydown",this._handleEscapeKey )
            }
            this.ontransitionEnd(()=>{
                    if(destroy){
                    this.backup.remove()// xử lí sau khi hoàn thành hết toàn bộ css hieuj ứng thì mới được đống lại
                    this.backup=null
                    this._footerModal=null
                    }
                    if(typeof this.opt.onClose==="function"){
                        this.opt.onClose()
                    }
                    if(!Popzy.elements.length){
                    document.body.style.overflow=""
                    document.body.style.paddingRight=""
                    }
        }
        )// này nó cũng duyệt callback trước rồi mới tính thực thi thân hàm phía trong
}
Popzy.prototype._getscrollbar=function(){
        if(this._scroll) return this._scroll
        
        const div =document.createElement("div")
        Object.assign(div.style,{
            position: "absolute",
            overflow: "scroll",
            top: '-999px'
        })
        document.body.appendChild(div)
        this._scroll=div.offsetWidth-div.clientWidth;
        console.log(`tinh toán kích thước thanh cuộn ${this._scroll}`)
        document.body.removeChild(div)// tránh đầy bộ nhớ , mình chỉ tìm kích thước thôi
        return this._scroll
}// tạo hàm tính giá trị của thanh cuộn



