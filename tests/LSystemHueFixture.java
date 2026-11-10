import java.awt.Color;
import java.lang.reflect.*;
/** Invoke original Turtle methods, including repeated quantized shifts. */
public class LSystemHueFixture {
 static String rgb(Color c){return "["+c.getRed()+","+c.getGreen()+","+c.getBlue()+"]";}
 public static void main(String[] args)throws Exception{
  Class<?> cls=Class.forName("gui.lsystem.Turtle");Constructor<?> constructor=cls.getDeclaredConstructor();constructor.setAccessible(true);
  Method set=cls.getDeclaredMethod("setColor",String.class),get=cls.getDeclaredMethod("getColor"),shift=cls.getDeclaredMethod("changeHue",double.class),increment=cls.getDeclaredMethod("setHueChange",double.class),step=cls.getDeclaredMethod("changeHue",boolean.class);
  for(Method method:new Method[]{set,get,shift,increment,step})method.setAccessible(true);
  String[] colors={"black","white","gray","0,0,0.2","pink","dukeBlue","forestGreen","purple","springGreen","128,64,96","12,13,14","0.73,0.25,0.6"};
  double[] angles={0,10,-10,60,-60,120,180,-180,360,-360,540,-540,720,361,-721,0.1,359.99,100000};
  System.out.println("{\"records\":[");boolean first=true;
  for(String color:colors)for(double angle:angles)for(boolean useDefault:new boolean[]{false,true}){
   Object turtle=constructor.newInstance();set.invoke(turtle,color);increment.invoke(turtle,angle);
   if(!first)System.out.println(",");first=false;
   System.out.print("{\"color\":\""+color+"\",\"angle\":"+angle+",\"useDefault\":"+useDefault+",\"steps\":[");
   for(int n=0;n<5;n++){if(n>0)System.out.print(",");if(useDefault)step.invoke(turtle,true);else shift.invoke(turtle,angle);System.out.print(rgb((Color)get.invoke(turtle)));}
   System.out.print("]}");
  }
  System.out.println("\n]}");
 }
}
