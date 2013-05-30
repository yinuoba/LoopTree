;(function($, window, undefined) {
	/**
	 * @description 根据数据源创建无限级树
	 * @namespace jQuery
	 * @constructor LoopTree
	 * 
	 * @param {Object} options 参数对象
	 * @param {Element} options.wrapDiv 包住整棵树的div节点
	 * @param {String} [options.loopTreeType] 树的type
	 * @param {String} [options.firstLevelProp] 获得第一级数据的属性名称
	 * @param {String} [options.loopObj = "children"] 第二级树在对象中的属性名称,默认是"data"
	 * @param {Boolean} [options.isCheckChild] 开关。点击树上的checkbox，是否选中其子树
	 * @param {Object} [options.dataSource] 直接给到的数据源，当给到数据源时，无需再给到url和params
	 * @param {String} [options.url] 异步获取数据源的url
	 * @param {String} [options.childUrl] 获取子树的服务
	 * @param {Object} [options.params = {}] 异步获取数据源的url需要的参数,默认为一空对象
	 * @param {Boolean} [options.isOnlyFirst = true] 开关。否初始化时只加载第一级树, 默认为true
	 * @param {Boolean} [options.isResizeBox = true] 开关。如果是在弹窗中打开一棵树，当树张开或收缩时重置box的大小
	 * @param {Boolean} [options.debug] 开启调试开关
	 * 
	 * @param {Function} [options.orgAlterFun] 机构-修改
	 * @param {Function} [options.orgDelFun] 机构-删除
	 * @param {Function} [options.orgAddChildFun] 机构-添加子机构
	 * @param {Function} [options.orgWarrantFun] 机构-授权企业
	 * @param {Function} [options.orgViewWarrantFun] 机构-查看已授权的企业
	 * @param {Function} [options.orgWarrantPropFun] 机构-授权企业属性
	 * @param {Function} [options.orgWarrantPropAssignedFun] 机构-授权指定企业的属性
	 * 
	 * @param {Function} [options.userWarrantFun] 用户-授权企业
	 * @param {Function} [options.userViewWarrantFun] 用户-查看已授权的企业
	 * @param {Function} [options.userWarrantPropFun] 用户-授权企业属性
	 * @param {Function} [options.userWarrantPropAssignedFun] 用户-授权指定企业的属性
	 * @param {Function} [options.userAssignRole] 用户-授权用户角色
	 *
	 * @param {Function} [options.roleAddRoleFun] 角色-添加角色
	 * @param {Function} [options.roleAlterRoleFun] 角色-修改角色
	 * @param {Function} [options.roleDelRoleFun] 角色-删除角色
	 * @param {Function} [options.roleWarrantFun] 角色-授权企业
	 * @param {Function} [options.roleViewWarrantFun] 角色-查看已授权的企业
	 * @param {Function} [options.roleWarrantPropFun] 角色-授权企业属性
	 * @param {Function} [options.roleWarrantPropAssignedFun] 角色-授权指定企业的属性
	 * 
	 * @return {jQuery.loopTree}	返回loopTree构造函数，并挂在jQuery对象上。
	 * @example
	 *  var orgTree = function orgTree(){
			var url = "{:U('corpauth/OrgConf/getAllOrgArr')}";
			var childUrl = "{:U('corpauth/OrgConf/getOrgTree')}";
			var userName = $('input#searchOrgTreeUserName').val();
			var orgName = $('input#searchOrgTreeOrgName').val();
			var defaultFun = function(){return false};
			var orgLoopTree = new jQuery.LoopTree({
		    wrapDiv: '#orgTreeContent',
		    url: url,
		    params: {userName: userName, orgName: orgName},
		    childUrl: childUrl,
		    // 机构操作
		    orgAlterFun: orgAlterFun,
		    orgDelFun: orgDelFun,
		    orgAddChildFun: orgAddChildFun,
		    orgWarrantFun: orgWarrantFun,
		    orgViewWarrantFun: orgViewWarrantFun,

		    orgWarrantPropFun: orgWarrantPropFun,
		    orgViewWarrantCorpFun: defaultFun,
		    orgWarrantPropAssignedFun: defaultFun,
		    // 用户操作
		    userWarrantFun: userWarrantFun,
		    userViewWarrantFun: userViewWarrantFun,
		    userWarrantPropFun: userWarrantPropFun,
		    userWarrantPropAssignedFun: defaultFun,
		    userAssignRole: userAssignRole,

		    debug: true
		  });
		  // 返回到window，供弹出页面调用
		  window.orgLoopTree = orgLoopTree;
		  return arguments.callee;	// 返回当前方法的引用
		}();
	 */
	var LoopTree = function(options) {
		var _this = this;
		// 定义公共属性
		_this.wrapDiv = $(options.wrapDiv);
		_this.loopTreeType = options.loopTreeType || 'org';
		_this.firstLevelProp = options.firstLevelProp;
		_this.url = options.url;
		_this.childUrl = options.childUrl;
		_this.dataSource = options.dataSource;
		_this.params = options.params || {};
		_this.isOnlyFirst = options.isOnlyFirst === false ? false : true;
		_this.isResizeBox = options.isResizeBox === false ? false : true;

		// 机构的操作回调，以当前a节点(jQuery对象)为参数(a上带id等参数)，回调的context为树的当前实例
		_this.orgAlterFun = options.orgAlterFun;
		_this.orgDelFun = options.orgDelFun;
		_this.orgAddChildFun = options.orgAddChildFun;
		_this.orgWarrantFun = options.orgWarrantFun;
		_this.orgViewWarrantFun = options.orgViewWarrantFun;
		_this.orgWarrantPropFun = options.orgWarrantPropFun;
		_this.orgWarrantPropAssignedFun = options.orgWarrantPropAssignedFun;

		// 用户的操作回调，以当前a节点(jQuery对象)为参数(a上带id等参数)，回调的context为树的当前实例
		_this.userWarrantFun = options.userWarrantFun;
		_this.userViewWarrantFun = options.userViewWarrantFun;
		_this.userWarrantPropFun = options.userWarrantPropFun;
		_this.userWarrantPropAssignedFun = options.userWarrantPropAssignedFun;
		_this.userAssignRole = options.userAssignRole;

		// 角色的操作回调，以当前a节点(jQuery对象)为参数(a上带id等参数)，回调的context为树的当前实例
		_this.roleAddRoleFun = options.roleAddRoleFun;
		_this.roleAlterRoleFun = options.roleAlterRoleFun;
		_this.roleDelRoleFun = options.roleDelRoleFun;
		_this.roleWarrantFun = options.roleWarrantFun;
		_this.roleViewWarrantFun = options.roleViewWarrantFun;
		_this.roleWarrantPropFun = options.roleWarrantPropFun;
		_this.roleWarrantPropAssignedFun = options.roleWarrantPropAssignedFun;

		_this.loopObj = options.loopObj || 'children';

		_this.isCheckChild = options.isCheckChild;

		_this.debug = options.debug;

		// 标识改树是不是在弹出的colorbox中
		_this.inColorbox = _this.wrapDiv.parents().find('#colorbox').length ? true : false;
		_this.inBox2 = _this.wrapDiv.parents().find('#box2').length ? true : false;

		_this.toString = Object.prototype.toString;
		_this.hasOwnProp = Object.prototype.hasOwnProperty;
		
		// 根据参数创建树并将树插入到wrapDiv中
		_this.init();
	}

	LoopTree.prototype = {
		constructor: LoopTree,
		init: function() {
			var _this = this;
			var treeNode, dataTree;
			// 区分直接给到的dataSource和url异步获取到的，没有给到数据源，则异步获取
			if(!_this.dataSource){
				// 异步发送请求，加载数据并构建树
				$.post(_this.url, _this.params, function(json) {
					if(!json) { // 判空
						_this.console('没有获取到数据源！');
						return false;
					}
					// 树的数据源，第一层循环
					if(_this.firstLevelProp){
						dataTree = json[_this.firstLevelProp];
					} else {
						dataTree = json;
					}
					treeNode = _this.buildTree(dataTree);	// 根据数据源，构建整棵树
					_this.wrapDiv.html('').append(treeNode);
					_this.resize();
				}, 'json');
			} else {
				treeNode = _this.buildTree(_this.dataSource);	// 根据数据源，构建整棵树
				_this.wrapDiv.append(treeNode);  //将树append到document中
				_this.resize();
			}
		},
		buildTree: function(dataTree){	// 根据不同的数据源创建树，返回构建出来的树节点
			var _this = this;
			// 创建最外层ul
			var $ul = $('<ul/>').attr('id', 'wrapTreeUl');
			// 循环最外层数据，生成第一级树
			$.each(dataTree, function() {
				var json = this;
				if(_this.toString.call(this) !== '[object Object]'){
					_this.console('该值不是可用对象！');
					return true;
				}
				_this.setPropName(json);	// 把id、name属性名称、树类型写入到json的属性中
				if(!json){
					_this.console('循环对象不存在！');
					return true;
				}

				var id = json[json['idProp']]; // 第一级都是机构
				var treeType = json["treeType"];	// 树的类型

				var $li = $('<li/>').attr({id: "loopLi" + treeType + id, treeId: id, isTop: "1"}).addClass("firstLine");
				// 标识。如果初始化时只加载第一级树，在点击该级树的时候，下面的ul初始化不隐藏
				$li.data('runOnce', 1);

				// 构建该级树及其对应的操作
				var $span = _this.buildSpan(json);

				// 根据是否有孩子设置样式
				var isHasChild = !json['nochild'];
				if(json['nochild'] === undefined){	// 处理没有nochild属性的情况，目前机构有这一属性
					isHasChild = false;
				}
				if(isHasChild || _this.hasChild(json)){	// 表示一级机构已经没有子树了
					_this.setClass($span, 'up');
				} else {
					_this.setClass($span, 'last');
				}

				$span.addClass('fts');
				$li.append($span);
				if (_this.isOnlyFirst) { // 点击第一级加载该级下的数据
					$li.click(function(){
						if(this.children.length == 1){ // 第一次加载的时候动态加载子树
							// 递归构建该级树下的所有树
							$.post(_this.childUrl, {orgId: id}, function(json){
								var isHasChildList = _this.hasChild(json);
								var isHasUserList = _this.hasUserList(json);
								var isHasRoleList = _this.hasRoleList(json);
								_this.buildChildTree(json, $li);
								if(isHasChildList || isHasUserList || isHasRoleList){	// 有子树，则改变箭头方向
									_this.setClass($span, 'fts down'); // 改箭头方向
								} else {
									_this.setClass($span, 'last fts'); // 改箭头方向
								}
							}, 'json');
						}
					});
				} else {  //直接加载整棵树
					_this.buildChildTree(json, $li); //	构建该级树及其对应的操作及其子树
				}
				$ul.append($li); // 将一级树添加到最外层ul
			});
			return $ul;
		},
		buildChildTree: function(json, $li) { // 根据数据源 递归构建子树
			var _this = this;
			// 获取数据源
			var childObj = json[_this.loopObj];
			var isHasChild = _this.hasChild(json);
			var isHasUserList = _this.hasUserList(json);
			var isHasRoleList = _this.hasRoleList(json);
			if (isHasChild || isHasUserList || isHasRoleList) {
				var $ul = $('<ul/>').css('display', 'none');
				// 当初始化时只加载第一级树，第一次点击第一级树时，ul初始化可见
				if(_this.isOnlyFirst && $li.data('runOnce')) {
					$ul.css('display', '');
					$li.removeData('runOnce');
					// 如果是通过colorbox弹出来的树，则每点击一下li，就要重算一下colorbox的大小
					_this.resize();
				}

				// 循环+递归children
				if(isHasChild){
					$.each(childObj, function() {
						// 获取当前对象
						var data = _this.setPropName(this);	// 把id、name属性名称、树类型写入到json的属性中

						var id = data[data['idProp']];
						var treeType = data["treeType"];	// 树的类型
						// 创建子集li
						var $li_child = $('<li/>').attr({id: "loopLi" + treeType + id, treeId: id});

						// 创建当前树及其相印操作
						var $span = _this.buildSpan(data);

						if(_this.hasUserList(data)){	// 存在用户列表
							var userList = data["userList"];
							$li_child.click(function(){
								if(this.children.length == 1){ // 第一次加载的时候动态加载子树
									var $this = $(this);
									var $userUl = _this.buildUserOrRoleList(userList);
									$this.append($userUl);
									_this.setClass($span, 'down');
								}
							});
						}
						if(_this.hasRoleList(data)){	// 存在角色列表
							var roleList = data["roleList"];
							$li_child.click(function(){
								if(this.children.length == 1){ // 第一次加载的时候动态加载子树
									var $this = $(this);
									var $roleUl = _this.buildUserOrRoleList(roleList);
									$this.append($roleUl);
									_this.setClass($span, 'down');
								}
							});
						}

						$li_child.append($span);

						// 递归构建树
						_this.buildChildTree(data, $li_child);

						$ul.append($li_child);
					});
				}

				// 既有用户又有child，则循环用户，一般是一级才会出现这种情况
				if(isHasUserList){
					_this.buildUserOrRoleList(json['userList'], $ul);	//创建用户列表并append到$ul中
				}
				// 既有用户又有child，则循环用户，一般是一级才会出现这种情况
				if(isHasRoleList){
					_this.buildUserOrRoleList(json['roleList'], $ul);	//创建用户列表并append到$ul中
				}
				// 先清空原有的
				$li.append($ul);
			} else {

			}
		},
		buildBranch: function(json, pid, ptype){	// 根据json和当前树的id和类型，创建子树
			var _this = this;
			var data = _this.setPropName(json);	// 把id、name属性名称、树类型写入到json的属性中
			var id = data[data['idProp']];
			var treeType = data["treeType"];	// 当前树的类型

			var $loopLi = $('#loopLi' + ptype + pid, _this.wrapDiv);
			var $oldSpan = $('#span' + ptype + pid, _this.wrapDiv);	// 上一级的span

			// 创建子集li
			var $li_child = $('<li/>').attr({id: "loopLi" + treeType + id, treeId: id});
			// 创建当前树及其相印操作
			var $span = _this.buildSpan(data);
			$li_child.append($span);

			if($oldSpan.hasClass('fts')){
				_this.setClass($oldSpan, 'fts down');
			} else {
				_this.setClass($oldSpan, 'down');
			}

			if($loopLi[0] && $loopLi[0].children.length == 1){	// 该一级机构还没有子树
				// 直接在一级机构上添加子机构，如果下面的树还没有被异步拉出来，则触发一下em上的事件拉出数据
				if($loopLi.attr('isTop')){
					$('#treeNameEm' + ptype + pid, _this.wrapDiv).click();
				} else {	// 非一级树上的添加子机构
					var $ul = $('<ul/>');
					// 把新创建的树添加到树中
					$ul.append($li_child);
					$loopLi.append($ul);
				}
			} else {
				var $ul = $('#loopLi' + ptype + pid + '>ul', _this.wrapDiv).show();
				// 把新创建的树添加到树中
				$ul.append($li_child);
			}
		},
		buildUserOrRoleList: function(json, $ul){	// 创建用户或角色列表，返回用户列表ul
			var _this = this;
			if(!$ul){	// 如果没有指定用户列表添加到特定的ul，则新创建一ul
				var $ul = $('<ul/>');
			}
			// 循环用户列表
			$.each(json, function(){
				var data = _this.setPropName(this);	// 把id、name属性名称、树类型写入到json的属性中
				
				var id = data[data['idProp']];
				var treeType = data["treeType"];	// 树的类型
				// 创建子集li
				var $li_child = $('<li/>').attr({id: "loopLi" + treeType + id, treeId: id});

				// 创建当前树及其相印操作
				var $span = _this.buildSpan(data);

				$li_child.append($span);

				$ul.append($li_child);
			});
			return $ul;
		},
		buildSpan: function(json) { // 根据id创建对应的树及其操作span
			var _this = this;
			// 获取这一级树的id和name
			var id = json[json['idProp']];
			var treeType = json["treeType"];	// 树的类型
			// 创建最外成span
			var $span = $('<span/>').addClass('up').attr({id: "span" + treeType + id, treeId: id});

			if(!_this.hasChild(json) && !_this.hasUserList(json) && !_this.hasRoleList(json)){
				_this.setClass($span, 'last');	// 最后一级树，改变箭头方向
			}

			// 创建树的checkbox并添加时间
			var $checkbox = _this.buildCheckbox(json);
			// 创建树的名称并添加时间
			var $quota_name = _this.buildEm(json);
			// 创建树的操作及添加相应事件
			var $operationDiv = _this.buildOperation(json);

			// 将树的checkbox、名称、操作 加入到span中
			$span.append($checkbox).append($quota_name).append($operationDiv);

			// 鼠标放在span上，操作出现
			$span.hover(function(){
				$span.find('div.operatings').css('visibility', 'visible')
			}, function(){
				$span.find('div.operatings').css('visibility', 'hidden')
			});

			return $span
		},
		buildCheckbox: function(json){
			var _this = this;
			var id = json[json['idProp']];
			var treeType = json["treeType"];	// 树的类型
			var is_all = json["is_all"];
			var has_my_all = json["has_my_all"];//1-全部，2-部分，0-没有（如果是灰掉的，切该数据为1或2的时候，后面显示一个删除本身关联的链接）
			var can_chang_all = json["can_chang_all"];
			var $input = $('<input/>');
			$input.attr({
				type: "checkbox",
				name: "chk_list",
				id: 'checkbox' + treeType + id,
				treeId: id
			}).addClass('checkMan');

			// 是否勾上
			is_all ? $input.attr("checked", "checked") : $input.removeAttr("checked");
			//是否灰掉，true-不灰掉，false-灰掉
			can_chang_all ? $input.removeAttr("disabled") : $input.attr("disabled", "disabled");

			// 根据_this.isCheckChild的值，判断是否在点击改树的checkbox时，子树的checkbox跟着变化
			if(_this.isCheckChild){
				$input.click(function(){
					var $this = $(this);
					var $childTree = $this.parent().next();	// 子树ul
					var $checkbox = $childTree.find('input[type="checkbox"]');	// 字数中checkbox
					if(this.checked){
						$checkbox.attr('checked', 'checked')
					} else {
						$checkbox.removeAttr('checked')
					}
				})
			}
			return $input;
		},
		buildEm: function(json){	// 创建树的名称节点em，并添加相应的时间
			var _this = this;
			var id = json[json['idProp']],
				quota_name = json[json['nameProp']],
				treeType = json["treeType"];

			var $quota_name = $('<em/>').attr({id: "treeNameEm" + treeType + id, treeId: id, title: quota_name}).css('cursor', 'pointer').html(quota_name);
			// 点击收起或张开树
			$quota_name.click(function(e){
				var $this = $(this);
				// 让em父级的span的兄弟ul显示
				var $ul = $this.parent().next();
				var $span = $this.parent();
				if($ul.length){
					if($ul.css('display') == 'none'){
						$ul.show();
						$span.removeClass('up').addClass('down')	// 改变箭头方向
					} else {
						$ul.hide();
						$span.removeClass('down').addClass('up')	// 改变箭头方向
					}
				}
				e.preventDefault();
			});
			return $quota_name;
		},
		buildOperation: function(json){	// 创建操作相关节点
			var _this = this;
			var id = json[json['idProp']];
			var type = json['treeType'];	// 该级树的类型，默认是机构

			// 创建各种操作
			var $operationDiv = $('<div/>').attr({id: "operationDiv" + type + id, treeId: id}).addClass('operatings').css('visibility', 'hidden');
			// 根据不同的树类型，添加不同的操作
			if(type == 'org'){	// 机构的操作
				if (_this.orgAlterFun && _this.isFunction(_this.orgAlterFun)) { // 修改
					var $a_alter = _this.buildA(id, "修改", _this.orgAlterFun); // 生成修改按钮并添加事件
					$operationDiv.append($a_alter); //将操作按钮添加到操作栏
				}
				if (_this.orgDelFun && _this.isFunction(_this.orgDelFun)) { // 删除
					var $a_delete = _this.buildA(id, '删除', _this.orgDelFun);
					$operationDiv.append(_this.buildI()).append($a_delete);
				}
				if (_this.orgAddChildFun && _this.isFunction(_this.orgAddChildFun)) { // 添加子机构
					var $a_addChild = _this.buildA(id, '添加子机构', _this.orgAddChildFun);
					$operationDiv.append(_this.buildI()).append($a_addChild);
				}
				if (_this.orgWarrantFun && _this.isFunction(_this.orgWarrantFun)) { // 授权企业
					var $a_warrant = _this.buildA(id, '授权企业', _this.orgWarrantFun);
					$operationDiv.append(_this.buildI()).append($a_warrant);
				}
				if (_this.orgViewWarrantFun && _this.isFunction(_this.orgViewWarrantFun)) { // 查看已授权的企业
					var $a_viewWarrant = _this.buildA(id, '查看已授权的企业', _this.orgViewWarrantFun);
					$operationDiv.append(_this.buildI()).append($a_viewWarrant);
				}
				if (_this.orgWarrantPropFun && _this.isFunction(_this.orgWarrantPropFun)) { // 授权企业属性
					var $a_warrantProp = _this.buildA(id, '授权企业属性', _this.orgWarrantPropFun);
					$operationDiv.append(_this.buildI()).append($a_warrantProp);
				}
				if (_this.orgWarrantPropAssignedFun && _this.isFunction(_this.orgWarrantPropAssignedFun)) { // 授权指定企业的属性
					var $a_warrantPropAssigned = _this.buildA(id, '授权指定企业的属性', _this.orgWarrantPropAssignedFun);
					$operationDiv.append(_this.buildI()).append($a_warrantPropAssigned);
				}
				if (_this.viewWarrantCorpFun && _this.isFunction(_this.viewWarrantCorpFun)) { // 查看授权指定企业
					var $a_viewWarrantCorp = _this.buildA(id, '授权指定企业的属性', _this.viewWarrantCorpFun);
					$operationDiv.append(_this.buildI()).append($a_viewWarrantCorp);
				}
			} else if(type == 'user'){	// 用户的操作
				if (_this.userWarrantFun && _this.isFunction(_this.userWarrantFun)) { // 授权企业
					var $a_userWarrantFun = _this.buildA(id, '授权企业', _this.userWarrantFun);
					$operationDiv.append($a_userWarrantFun);
				}
				if (_this.userViewWarrantFun && _this.isFunction(_this.userViewWarrantFun)) { // 查看已授权的企业
					var $a_userViewWarrantFun = _this.buildA(id, '查看已授权的企业', _this.userViewWarrantFun);
					$operationDiv.append(_this.buildI()).append($a_userViewWarrantFun);
				}
				if (_this.userWarrantPropFun && _this.isFunction(_this.userWarrantPropFun)) { // 授权企业属性
					var $a_userWarrantPropFun = _this.buildA(id, '授权企业属性', _this.userWarrantPropFun);
					$operationDiv.append(_this.buildI()).append($a_userWarrantPropFun);
				}
				if (_this.userWarrantPropAssignedFun && _this.isFunction(_this.userWarrantPropAssignedFun)) { // 授权指定企业的属性
					var $a_userWarrantPropAssignedFun = _this.buildA(id, '授权指定企业的属性', _this.userWarrantPropAssignedFun);
					$operationDiv.append(_this.buildI()).append($a_userWarrantPropAssignedFun);
				}
				if (_this.userAssignRole && _this.isFunction(_this.userAssignRole)) { // 授权用户角色
					var $a_userAssignRole = _this.buildA(id, '授权用户角色', _this.userAssignRole);
					$operationDiv.append(_this.buildI()).append($a_userAssignRole);
				}
			} else if(type == 'roleOrg'){	// 角色树上对机构的操作
				if (_this.roleAddRoleFun && _this.isFunction(_this.roleAddRoleFun)) { // 添加角色
					var $a_roleAddRoleFun = _this.buildA(id, '添加角色', _this.roleAddRoleFun);
					$operationDiv.append($a_roleAddRoleFun);
				}
			} else if(type == 'role'){
				if (_this.roleAlterRoleFun && _this.isFunction(_this.roleAlterRoleFun)) { // 修改角色
					var $a_roleAlterRoleFun = _this.buildA(id, '修改', _this.roleAlterRoleFun);
					$operationDiv.append($a_roleAlterRoleFun);
				}
				if (_this.roleDelRoleFun && _this.isFunction(_this.roleDelRoleFun)) { // 删除角色
					var $a_roleDelRoleFun = _this.buildA(id, '删除', _this.roleDelRoleFun);
					$operationDiv.append(_this.buildI()).append($a_roleDelRoleFun);
				}
				if (_this.roleWarrantFun && _this.isFunction(_this.roleWarrantFun)) { // 授权企业
					var $a_roleWarrantFun = _this.buildA(id, '授权企业', _this.roleWarrantFun);
					$operationDiv.append(_this.buildI()).append($a_roleWarrantFun);
				}
				if (_this.roleViewWarrantFun && _this.isFunction(_this.roleViewWarrantFun)) { // 查看已授权的企业
					var $a_roleViewWarrantFun = _this.buildA(id, '查看已授权的企业', _this.roleViewWarrantFun);
					$operationDiv.append(_this.buildI()).append($a_roleViewWarrantFun);
				}
				if (_this.roleWarrantPropFun && _this.isFunction(_this.roleWarrantPropFun)) { // 授权企业属性
					var $a_roleWarrantPropFun = _this.buildA(id, '授权企业属性', _this.roleWarrantPropFun);
					$operationDiv.append(_this.buildI()).append($a_roleWarrantPropFun);
				}
				if (_this.roleWarrantPropAssignedFun && _this.isFunction(_this.roleWarrantPropAssignedFun)) { // 授权指定企业的属性
					var $a_roleWarrantPropAssignedFun = _this.buildA(id, '授权指定企业的属性', _this.roleWarrantPropAssignedFun);
					$operationDiv.append(_this.buildI()).append($a_roleWarrantPropAssignedFun);
				}
			} else if(type == 'readOnly') {	// 只读 无操作
				return null;
			}
			
			return $operationDiv;
		},
		buildI: function() { // 创建操作之间的分割I
			return $('<i/>').addClass('lineMid');
		},
		buildA: function(id, html, callback) { // 创建a操作
			var _this = this;
			var innerHtml = html || "";
			var $a = $('<a/>').attr({id:"operationA" + id, treeId: id, href: "javascript:void(0)", hidefocus: "hidefocus", title: innerHtml}).html(innerHtml);
			if (callback) { 
				// 如果参数中给到了回调，则执行回调。当前a节点作为参数，当前树实例_this为callback的context
				$a.click(callback.bind(_this, $a));
			}
			return $a;
		},
		updateTreeName: function(id, treeType, html){	// 修改树的名称
			var _this = this;
			$('#treeNameEm' + treeType + id, _this.wrapDiv).html(html);
		},
		removeLi: function(id, treeType){	// 根据id删除一棵树
			var _this = this;
			var $li = $('#loopLi' + treeType + id, _this.wrapDiv);
			var $ul = $li.parent();
			var $span = $ul.siblings('span');
			if($ul[0] && $ul[0].children.length == 1){	// 如果只有当前一个子树，则上一级的图标换掉
				if($span.hasClass('fts')){	// 一级树特殊处理class
					_this.setClass($span, 'fts last');
				} else {
					_this.setClass($span, 'last');
				}
			}
			$li.remove();
		},
		isFunction: function(callback){
			var _this = this;
			return _this.toString.call(callback) === '[object Function]'
		},
		setClass: function($this, newClass){ // 设置元素的class
			$this.removeClass().addClass(newClass)
		},
		resize: function(){
			var _this = this;
			// 如果是通过colorbox弹出来的树，则每点击一下li，就要重算一下colorbox的大小
			if(_this.inColorbox && _this.isResizeBox){
				$.colorbox.resize();
			}
			if(_this.inBox2 && _this.isResizeBox){
				$.box2.resize();
			}
		},
		setPropName: function(json){	// 将该级树的id和name属性名称设置到json的相应属性中
			var _this = this;
			if(_this.hasOwnProp.call(json, 'os_id') && _this.hasOwnProp.call(json, 'org_name') && _this.loopTreeType){	// 机构数据
				json["idProp"] = 'os_id';
				json["nameProp"] = 'org_name';
				json["treeType"] = _this.loopTreeType
			} else if(_this.hasOwnProp.call(json, 'uid') && _this.hasOwnProp.call(json, 'uname')){	// 用户数据
				json["idProp"] = 'uid';
				json["nameProp"] = 'uname';
				json["treeType"] = "user"
			} else if(_this.hasOwnProp.call(json, 'dim_code') && _this.hasOwnProp.call(json, 'dim_name')){	// 企业属性树一级数据
				json["idProp"] = 'id';
				json["nameProp"] = 'dim_name';
				json["treeType"] = "readOnly"
			} else if(_this.hasOwnProp.call(json, 'item_desc') && _this.hasOwnProp.call(json, 'item_no')){	// 企业属性树一级以外数据
				json["idProp"] = 'id';
				json["nameProp"] = 'item_name_cn';
				json["treeType"] = "readOnly"
			} else if(_this.hasOwnProp.call(json, 'role_desc') && _this.hasOwnProp.call(json, 'role_name')){	// 角色数据
				json["idProp"] = 'id';
				json["nameProp"] = 'role_name';
				json["treeType"] = "role"
			} else {	// 默认属性名称
				json["idProp"] = 'id';
				json["nameProp"] = 'quota_name';
				json["treeType"] = "readOnly"
			}
			return json
		},
		hasChild: function(json){	// 判断是否还存在孩子节点
			var _this = this;
			if(json[_this.loopObj] && !_this.isEmptyObj(json[_this.loopObj])){
				return true;
			}
			return false;
		},
		hasUserList: function(json){	// 判断是否存在用户列表
			var _this = this;
			if(json['userList'] && !_this.isEmptyObj(json['userList'])){
				return true;
			}
		},
		hasRoleList: function(json){	// 判断是否存在角色列表
			var _this = this;
			if(json['roleList'] && !_this.isEmptyObj(json['roleList'])){
				return true;
			}
		},
		console: function(msg){	// 输出错误信息到错误控制台
			var _this = this;
			if(window.console && _this.debug){
				console.error(msg);
			}
		},
		isEmptyObj: function(obj){	// 判断数组或对象是否为空
			var _this = this;
			var result = true;
			for(var o in obj){
				if(_this.hasOwnProp.call(obj, o)){
					result = false;
					break;
				}
			}
			return result;
		}
	}

	// 将LoopTree组件放到jQuery对象上
	jQuery.LoopTree = LoopTree;

})(jQuery, window, undefined);