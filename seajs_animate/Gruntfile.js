/**
 * Created by guomilo@gmail.com on 3/4/14.
 */
module.exports = function (grunt) {

    grunt.initConfig({
            pkg:grunt.file.readJSON('package.json'),
            transport:{
                app:{
                    options:{
                        paths:["app"],
                        idleading:"app/js/"
                    },
                    files:[{
                        expand:true,
                        cwd:'app/js',
                        src:'**/*.js',
                        dest:'.build/app/js'
                    }]
                },
                mysrc:{
                    options:{
                        paths:["src"],
                        idleading:'src/'
                    },
                    files:[{
                        expand:true,
                        cwd:'src/',
                        src:'**/*.js',
                        dest:'.build/src/'
                    }]
                }
            },
            concat:{
                app:{
                    options:{
                        include:'all'
                    },
                    files:[{
                        expand:true,
                        cwd:".build/app",
                        src:'**/*.js',
                        dest:'dist/app/'

                    }]
                },
                main:{
                    options:{
                        include:'all'
                    },
                    files:[{
                        expand:true,
                        cwd:".build/src/lib/",
                        src:'**/animate*.js',
                        dest:'dist/src/lib/'

                    }]
                },
                main1:{
                    options:{
                        include:'self'
                    },
                    files:[{
                        expand:true,
                        cwd:".build/src/lib/",
                        src:'**/core*.js',
                        dest:'dist/src/lib/'

                    }]
                },
                mysrc:{
                    options:{
                        include:'self'
                    },
                    files:[{
                        expand:true,
                        cwd:".build/src/tools/",
                        src:'**/*.js',
                        dest:'dist/src/tools/'

                    }]
                }

            },
           uglify:{
               options:{
                    banner:'/*@author <%=pkg.author %>\n * @Date <%= grunt.template.today("yyyy-mm-dd") %> \n */\n'
                },
               app:{
                   files:[{
                       expand:true,
                       cwd:"dist/app",
                       src:['**/*.js','!**/*-debug.js'],
                       dest:'dist/app/'
                   }]
               },
                mysrc:{

                    files:[{
                        expand:true,
                        cwd:"dist/src",
                        src:['**/*.js','!**/*-debug.js'],
                        dest:'dist/src/'
                    }]
                }

           },
           clean : {
            spm : ['.build']
           }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('default', ['transport',"concat","uglify","clean"]);

}