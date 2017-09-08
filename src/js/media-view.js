(function($,window,o){
	var cheese = wp.media.cheese,
		Button = wp.media.view.Button,
		Modal  = wp.media.view.Modal,
		l10n   = cheese.l10n;


	wp.media.cheese.view.DataSourceImageUploader = wp.media.View.extend({
		template: wp.template('cheese-uploader'),
		className: 'cheese-uploader',
		controller:null,
		image : null,
		$discardBtn : null,
		$uploadBtn : null,
		
		uploader : null,
		
		events : {
			'click [data-action="upload"]'	: 'uploadImage',
			'click [data-action="discard"]'	: 'discardImage',
		},
		initialize : function() {

			wp.media.View.prototype.initialize.apply( this, arguments );

			_.defaults( this.options, {
				defaultFileName : l10n.image
			});
			var self = this,
				instr = new wp.media.View({
				tagName    : 'div',
				className  : 'instruments',
				controller : this.controller
			});

			this.uploader = this.options.uploder;
		},
		setImageData : function( data ) {
			var container = this.$imageContainer.html('').get(0),
				self = this;
			if ( this.image ) 
				this.image.destroy();

			this.image = new o.Image();
			this.image.onload = function() {
				var opts = self.getUploader().getOption('resize'),
					scale = Math.max( opts.width / this.width, opts.height / this.height );
				!!opts && (scale < 1) && this.downsize( this.width*scale, this.height*scale );
				this.embed( container );
			}
			this.image.bind('Resize', function(e) {
				this.embed( container );
			});
			this.image.load( data );
			if ( this.$imageContainer )
				this.$imageContainer.append(this.image);
			this.disabled(false);
			return this;
		},
		render : function() {
			wp.media.View.prototype.render.apply(this,arguments);
			this.$imageContainer = this.$('.image-container');
			this.$discardBtn = this.$('[data-action="discard"]');
			this.$uploadBtn = this.$('[data-action="upload"]');
			this.$('[data-setting="title"]').val( this.options.defaultFileName );
			return this;
		},
		discardImage : function(){
			this.trigger( 'action:discard:dataimage' , this );
			this.unbindUploaderEvents();
		},
		uploadImage : function() {

			var type = 'image/png',
				name = this.$('input[data-setting="title"]').val() + '.png',
				blob = this.image.getAsBlob( type );

			this.bindUploaderEvents();

			blob.detach( blob.getSource() );
			blob.name = name;
			blob.type = type;
			this.getUploader().addFile( blob , name );

			this.disabled( true );

			this.trigger( 'action:upload:dataimage' , this );
		},
		show:function(){
			this.$el.show();
			return this;
		},
		hide:function(){
			this.$el.hide();
			return this;
		},
		disabled : function( disabled ) {
			this.$discardBtn.prop( 'disabled', disabled );
			this.$uploadBtn.prop( 'disabled', disabled );
		},
		_uploadSuccessHandler : function() {
			this.trigger( 'action:uploaded:dataimage' );
			this.disabled(false);
			this.unbindUploaderEvents();
		},
		_uploadErrorHandler : function() {
			this.trigger( 'error:uploaded:dataimage' );
			this.disabled(false);
			this.unbindUploaderEvents();
		},
		bindUploaderEvents : function() {
			this.getUploader().bind( 'FileUploaded',	this._uploadSuccessHandler,	this );
			this.getUploader().bind( 'Error',			this._uploadErrorHandler,	this );
		},
		unbindUploaderEvents : function() {
			this.getUploader().unbind( 'FileUploaded',	this._uploadSuccessHandler,	this );
			this.getUploader().unbind( 'Error',			this._uploadErrorHandler,	this );
		},
		getUploader: function() {
			return this.controller.uploader.uploader.uploader;
		}
	});


	wp.media.cheese.view.WebcamRecorder = wp.media.View.extend({
//		tagName:   'div',
		template: wp.template('cheese-recorder'),
		className: 'cheese-recorder',
		controller:null,
		action:'record',
		$webcam : null,
		$recorder : null,

		events: {
			'click [data-action="init"]' : 'start',
			'click [data-action="record"]' : 'recordImage'
		},
		render: function() {
			var self = this,
				recorderOptions = {
					camera:{mandatory:{
						minWidth: 640,
						minHeight: 480
					}},
					microphone:false
				};

			wp.media.View.prototype.render.apply( this, arguments );

			this.$recorder = this.$('.recorder');

			this.$webcam = $(this.$recorder).recorder(recorderOptions)

			return this;
		},
		recordImage: function( e ){
			this.trigger('action:create:dataimage', this , this.$webcam.snapshot() );
			this.stop();
		},
		get_state : function() {
			return this.$webcam.state;
		},
		start : function() {
			var self = this;
			if ( ! this.$recorder.is(':visible') ) {
				this.$recorder.show();
			}
			this.$webcam.start();
			return this;
		},
		stop : function(){
			this.$webcam.stop();
			if ( this.$recorder.is(':visible') ) {
				this.$recorder.hide();
			}
			return this;
		},
		show:function(){
			this.$el.show();
			return this;
		},
		hide:function(){
			this.$el.hide();
			return this;
		}
	});
	
	wp.media.cheese.view.Pasteboard = wp.media.View.extend({
		template: wp.template('cheese-pasteboard'),
		className: 'cheese-pasteboard',
		controller:null,
		action:'paste',
		$pasteboard : null,

		render: function() {
			var self = this;
			wp.media.View.prototype.render.apply(this,arguments);
			this.$pasteboard = this.$( '.injector' ).pastableContenteditable();
			this.$message = this.$( '.message' );
			this.$pasteboard.on('click', function(){
				self.show_message('');
			} );
			return this;
		},
		start : function(){
			var self = this;

			this.$pasteboard
				.on('pasteImage' , function( e, data ) {
					self.trigger( 'action:create:dataimage', this , data.dataURL );
				} )
				.on('pasteImageError' , function( e, data ) {
					self.show_message( l10n.paste_error );
					$( this ).html('');
				} )
				.on('pasteText' , function( e, data ) {
					self.show_message( l10n.paste_error_no_image );
					$( this ).html('');
				} );

			setTimeout(function(){
				self.$pasteboard.get(0).focus();
			},1);

			return this;
		},
		stop : function(){
			this.$pasteboard
				.off('pasteImage')
				.off('pasteImageError')
				.off('pasteText');
			return this;
		},
		show:function(){
			this.$el.show();
			return this;
		},
		hide:function(){
			this.$el.hide();
			return this;
		},
		show_message:function( msg ) {
			this.$message.text( msg );
		}
	});

	wp.media.cheese.view.DataSourceImageGrabber = wp.media.View.extend({
//		tagName:   'div',
		template: wp.template('cheese-grabber'),
		className : 'cheese-grabber',
		
		grabber : null,
		uploader : null,
		
		initialize : function() {
			var ret = wp.media.View.prototype.initialize.apply( this, arguments );

			_.defaults( this.options, {
				wpuploader		: null,
				defaultFileName	: (this.options.grabber == wp.media.cheese.view.WebcamRecorder) 
						? l10n.snapshot 
						: ((this.options.grabber == wp.media.cheese.view.Pasteboard) 
							? l10n.pasted 
							: l10n.image 
						),
				title			: (this.options.grabber == wp.media.cheese.view.WebcamRecorder) 
						? l10n.take_snapshot 
						: ((this.options.grabber == wp.media.cheese.view.Pasteboard) 
							? l10n.copy_paste 
							: l10n.image 
						)
			});

			this.grabber  = new this.options.grabber( { controller	: this.controller } );

			this.uploader = new wp.media.cheese.view.DataSourceImageUploader( {	
									controller		: this.controller,
									uploder			: this.options.wpuploader,
									defaultFileName	: this.options.defaultFileName
								});
			this.render();

			this.listenTo( this.grabber, 'action:create:dataimage',	this.imageCreated );
			this.listenTo( this.uploader, 'action:discard:dataimage',	this.startGrabbing );

			return ret;
		},
		render:function(){
			var self = this;

			wp.media.View.prototype.render.apply( this, arguments );

			this.$('.content')
				.append( this.grabber.render().$el )
				.append( this.uploader.render().$el );

			return this;
		},
		imageCreated : function( grabber , imageData ) {
			this.grabber.stop().hide();
			this.uploader.show().setImageData( imageData );
		},
		startGrabbing:function() {
			this.uploader.hide();
			this.grabber.show().start();
			return this;
		},
		stopGrabbing:function() {
			this.grabber.stop();
			return this;
		},
		getAction : function() {
			return this.grabber.action;
		},
		dismiss:function() {
			this.grabber.stop();
			return this;
		}
	});

})(jQuery,window,mOxie);
