import { View, Text, StyleSheet } from "react-native";
import { FC } from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  color?: {
    preTitle?: string;
    title?: string;
  };
}

const Logo: FC<LogoProps> = ({
  size = "medium",
  color = {
    preTitle: "#A26FFD",
    title: "#000000",
  },
}) => {
  const getFontSize = () => {
    switch (size) {
      case "small":
        return 24;
      case "large":
        return 48;
      default:
        return 40;
    }
  };

  const fontSize = getFontSize();

  return (
    <View style={styles.textContainer}>
      <Text style={[styles.preTitle, { fontSize, color: color.preTitle }]}>
        COA-
      </Text>
      <Text style={[styles.title, { fontSize, color: color.title }]}>CH</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  preTitle: {
    fontFamily: "Roboto",
    fontWeight: "700",
    lineHeight: 40,
    letterSpacing: 0,
  },
  title: {
    fontFamily: "Roboto",
    fontWeight: "700",
    lineHeight: 40,
    letterSpacing: 0,
  },
});

export default Logo;
